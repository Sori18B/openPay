import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCardChargeDto } from './dto/chargeCard.dto';
import { CreateBankChargeDto } from './dto/chargeTransfer.dto';

@Injectable()
export class ChargesService {
  private readonly logger = new Logger(ChargesService.name);
  private readonly openpayUrl: string;
  private readonly merchantId: string;
  private readonly privateKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {
    const merchantId = this.configService.get<string>(
      'OPENPAY_MERCHANT_ID',
      '',
    );
    const privateKey = this.configService.get<string>(
      'OPENPAY_PRIVATE_KEY',
      '',
    );
    const openpayUrl = this.configService.get<string>('OPENPAY_URL');
  }

  private getAuth() {
    return {
      username: this.privateKey,
      password: '',
    };
  }

  // Crear cargo con tarjeta (pago único)
  async createCardCharge(dto: CreateCardChargeDto) {
    this.logger.debug(`Creating card charge for customer: ${dto.customerId}`);

    // Obtener el cliente de nuestra base de datos
    const customer = await this.prisma.users.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (!customer.openpayId) {
      throw new BadRequestException(
        'Cliente no tiene ID de Openpay configurado',
      );
    }

    const chargeData = {
      method: 'card',
      source_id: dto.source_id,
      amount: dto.amount,
      currency: dto.currency || 'MXN',
      description: dto.description,
      device_session_id: dto.device_session_id,
      order_id: dto.order_id || this.generateOrderId(),
      use_3d_secure: true, // Recomendado para mayor seguridad
    };

    try {
      this.logger.debug(
        'Sending charge request to Openpay:',
        JSON.stringify(chargeData, null, 2),
      );

      const response = await this.httpService.axiosRef.post(
        `${this.openpayUrl}/v1/${this.merchantId}/customers/${customer.openpayId}/charges`,
        chargeData,
        {
          auth: this.getAuth(),
          timeout: 30000, // 30 segundos timeout
        },
      );

      this.logger.debug(
        'Openpay response:',
        JSON.stringify(response.data, null, 2),
      );

      // Guardar transacción en base de datos
      const transaction = await this.prisma.transaction.create({
        data: {
          openpayId: response.data.id,
          source_id: dto.source_id,
          amount: response.data.amount,
          currency: response.data.currency,
          description: response.data.description,
          order_id: response.data.order_id,
          device_session_id: dto.device_session_id,
          status: response.data.status,
          method: 'card',
          customerId: customer.id,
          metadata: response.data,
        },
      });

      return {
        success: true,
        transaction,
        openpay_data: response.data,
      };
    } catch (error) {
      this.logger.error('Error creating card charge:', {
        error: error.response?.data || error.message,
        customerId: dto.customerId,
        amount: dto.amount,
      });

      // Guardar transacción fallida para auditoría
      try {
        await this.prisma.transaction.create({
          data: {
            openpayId: `failed_${Date.now()}`,
            source_id: dto.source_id,
            amount: dto.amount,
            currency: dto.currency || 'MXN',
            description: dto.description,
            order_id: dto.order_id || this.generateOrderId(),
            device_session_id: dto.device_session_id,
            status: 'failed',
            method: 'card',
            customerId: customer.id,
            metadata: {
              error: error.response?.data || error.message,
            },
          },
        });
      } catch (dbError) {
        this.logger.error('Error saving failed transaction:', dbError);
      }

      throw new BadRequestException(
        error.response?.data?.description ||
          error.response?.data?.error_code ||
          'Error al procesar el pago con tarjeta',
      );
    }
  }

  // Crear cargo con transferencia bancaria
  async createBankCharge(dto: CreateBankChargeDto) {
    this.logger.debug(`Creating bank charge for customer: ${dto.customerId}`);

    // Obtener el cliente de nuestra base de datos
    const customer = await this.prisma.users.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (!customer.openpayId) {
      throw new BadRequestException(
        'Cliente no tiene ID de Openpay configurado',
      );
    }

    const chargeData = {
      method: 'bank_account',
      amount: dto.amount,
      currency: dto.currency || 'MXN',
      description: dto.description,
      order_id: dto.order_id || this.generateOrderId(),
      due_date: dto.due_date || this.getDefaultDueDate(),
    };

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.openpayUrl}/v1/${this.merchantId}/customers/${customer.openpayId}/charges`,
        chargeData,
        {
          auth: this.getAuth(),
          timeout: 30000,
        },
      );

      // Guardar transacción en base de datos
      const transaction = await this.prisma.transaction.create({
        data: {
          openpayId: response.data.id,
          amount: response.data.amount,
          currency: response.data.currency,
          description: response.data.description,
          order_id: response.data.order_id,
          status: response.data.status,
          method: 'bank_account',
          customerId: customer.id,
          clabe: response.data.payment_method?.clabe,
          dueDate: new Date(response.data.due_date),
          metadata: response.data,
        },
      });

      return {
        success: true,
        transaction,
        payment_info: {
          clabe: response.data.payment_method?.clabe,
          bank: response.data.payment_method?.bank,
          due_date: response.data.due_date,
        },
        openpay_data: response.data,
      };
    } catch (error) {
      this.logger.error('Error creating bank charge:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.description ||
          'Error al generar la transferencia bancaria',
      );
    }
  }

  // Obtener el estado de una transacción
  async getTransactionStatus(transactionId: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { customer: true },
      });

      if (!transaction) {
        throw new NotFoundException('Transacción no encontrada');
      }

      // Consultar estado actual en Openpay
      const response = await this.httpService.axiosRef.get(
        `${this.openpayUrl}/v1/${this.merchantId}/customers/${transaction.customer.openpayId}/charges/${transaction.openpayId}`,
        {
          auth: this.getAuth(),
          timeout: 15000,
        },
      );

      // Actualizar el estado en nuestra base de datos si cambió
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: response.data.status,
          metadata: response.data,
        },
        include: { customer: true },
      });

      return {
        success: true,
        transaction: updatedTransaction,
        openpay_status: response.data.status,
      };
    } catch (error) {
      this.logger.error(
        'Error getting transaction status:',
        error.response?.data,
      );
      throw new BadRequestException(
        error.response?.data?.description ||
          'Error al obtener el estado de la transacción',
      );
    }
  }

  // Listar transacciones de un cliente
  async getCustomerTransactions(
    customerId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { customerId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: { customerId },
      }),
    ]);

    return {
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Helper para generar order_id único
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper para obtener fecha de vencimiento por defecto (72 horas)
  private getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 días para pagar
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  // Webhook para manejar notificaciones de Openpay
  async handleWebhook(webhookData: any) {
    this.logger.debug(
      'Processing webhook:',
      JSON.stringify(webhookData, null, 2),
    );

    try {
      if (
        webhookData.type === 'charge.succeeded' ||
        webhookData.type === 'charge.failed' ||
        webhookData.type === 'charge.cancelled'
      ) {
        const charge = webhookData.data.object;

        // Buscar la transacción por openpayId
        const transaction = await this.prisma.transaction.findUnique({
          where: { openpayId: charge.id },
        });

        if (transaction) {
          // Actualizar el estado
          await this.prisma.transaction.update({
            where: { openpayId: charge.id },
            data: {
              status: charge.status,
              metadata: charge,
            },
          });

          this.logger.log(
            `Transaction ${charge.id} updated to status: ${charge.status}`,
          );
        }
      }

      return { success: true, processed: true };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw new BadRequestException('Error processing webhook');
    }
  }
}
