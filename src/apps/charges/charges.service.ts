import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCardChargeDto } from './dto/chargeCard.dto';
//import { CreateBankChargeDto } from './dto/chargeTransfer.dto';

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
    const merchantId = this.configService.get<string>('OPENPAY_MERCHANT_ID', '');
    const privateKey = this.configService.get <string>('OPENPAY_PRIVATE_KEY', '');
    const openpayUrl = this.configService.get<string>('OPENPAY_URL');
  }

  private getAuth() {
    return {
      username: this.privateKey,
      password: '',
    };
  }

  // Crear cargo con tarjeta
  async createCardCharge(dto: CreateCardChargeDto) {
    // Obtener el cliente de nuestra base de datos
    const customer = await this.prisma.users.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new BadRequestException('Cliente no encontrado');
    }

    const chargeData = {
      method: 'card',
      source_id: dto.source_id,
      amount: dto.amount,
      currency: dto.currency || 'MXN',
      description: dto.description,
      device_session_id: dto.device_session_id,
      order_id: dto.order_id,
    };

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.openpayUrl}/v1/${this.merchantId}/customers/${customer.id}/charges`,
        chargeData,
        { auth: this.getAuth() },
      );

      // Guardar transacción en base de datos
      return await this.prisma.transaction.create({
        data: {
          openpayId: response.data.id,
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status,
          method: 'card',
          description: response.data.description,
          customerId: customer.id,
          metadata: response.data,
        },
      });
    } catch (error) {
      this.logger.error('Error creating card charge:', error.response?.data);
      throw new BadRequestException(
        error.response?.data?.description ||
          'Error al procesar el pago con tarjeta',
      );
    }
  }

  // // Crear cargo con transferencia bancaria
  // async createBankCharge(dto: CreateBankChargeDto) {
  //   // Obtener el cliente de nuestra base de datos
  //   const customer = await this.prisma.users.findUnique({
  //     where: { id: dto.customerId },
  //   });

  //   if (!customer) {
  //     throw new BadRequestException('Cliente no encontrado');
  //   }

  //   const chargeData = {
  //     method: 'bank_account',
  //     amount: dto.amount,
  //     currency: dto.currency || 'MXN',
  //     description: dto.description,
  //     order_id: dto.order_id,
  //     due_date: dto.due_date || this.getDefaultDueDate(),
  //   };

  //   try {
  //     const response = await this.httpService.axiosRef.post(
  //       `${this.openpayUrl}/v1/${this.merchantId}/customers/${customer.openpayId}/charges`,
  //       chargeData,
  //       { auth: this.getAuth() },
  //     );

  //     // Guardar transacción en base de datos
  //     return await this.prisma.transaction.create({
  //       data: {
  //         id: response.id,
  //         openpayId: response.data.id,
  //         amount: response.data.amount,
  //         currency: response.data.currency,
  //         status: response.data.status,
  //         method: 'bank_account',
  //         description: response.data.description,
  //         customerId: customer.id,
  //         clabe: response.data.payment_method?.clabe,
  //         dueDate: new Date(response.data.due_date),
  //         metadata: response.data,
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error('Error creating bank charge:', error.response?.data);
  //     throw new BadRequestException(
  //       error.response?.data?.description ||
  //         'Error al generar la transferencia bancaria',
  //     );
  //   }
  // }

  // // Obtener el estado de una transacción
  // async getTransactionStatus(transactionId: string) {
  //   try {
  //     const transaction = await this.prisma.transaction.findUnique({
  //       where: { id: transactionId },
  //       include: { customer: true },
  //     });

  //     if (!transaction) {
  //       throw new BadRequestException('Transacción no encontrada');
  //     }

  //     const response = await this.httpService.axiosRef.get(
  //       `${this.openpayUrl}/v1/${this.merchantId}/customers/${transaction..openpayId}/charges/${transaction.openpayId}`,
  //       { auth: this.getAuth() },
  //     );

  //     // Actualizar el estado en nuestra base de datos
  //     return await this.prisma.transaction.update({
  //       where: { id: transactionId },
  //       data: {
  //         status: response.data.status,
  //         metadata: response.data,
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error(
  //       'Error getting transaction status:',
  //       error.response?.data,
  //     );
  //     throw new BadRequestException(
  //       error.response?.data?.description ||
  //         'Error al obtener el estado de la transacción',
  //     );
  //   }
  // }

  // Helper para obtener fecha de vencimiento por defecto (72 horas)
  private getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 días para pagar
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
}
