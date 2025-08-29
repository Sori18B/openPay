import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateChargeDto } from './dto/create.charge.dto';
import { ChargeResponseDto } from './dto/response.create.charge.dto';
import { ChargeDto } from './dto/charge.dto';
import axios, { AxiosError } from 'axios';

@Injectable()
export class CreateChargesService {
  private readonly logger = new Logger(CreateChargesService.name);
  private readonly MerchantId: string;
  private readonly PrivateKey: string;
  private readonly BaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.MerchantId = this.configService.get<string>('OPENPAY_MERCHANT_ID', '');
    this.PrivateKey = this.configService.get<string>('OPENPAY_PRIVATE_KEY', '');
    this.BaseUrl = this.configService.get<string>(
      'OPENPAY_BASE_URL',
      'https://api.openpay.mx',
    );

    if (!this.MerchantId || !this.PrivateKey) {
      throw new Error(
        'Las credenciales de Openpay no están configuradas correctamente',
      );
    }
  }

  async createCharge(
    createPaymentDto: CreateChargeDto,
  ): Promise<ChargeResponseDto> {
    const {
      cardToken,
      productId,
      customerName,
      customerEmail,
      description,
      deviceSessionId,
    } = createPaymentDto;

    let chargeToSave: ChargeDto;
    let product;

    try {
      this.logger.log(`Buscando producto con ID: ${productId}`);
      product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          price: true,
          currency: true,
          name: true,
          isActive: true,
        },
      });

      if (!product || !product.isActive) {
        throw new HttpException(
          'El producto solicitado no existe o no está disponible',
          HttpStatus.NOT_FOUND,
        );
      }

      const chargeData = {
        source_id: cardToken,
        method: 'card',
        amount: Number(product.price),
        currency: product.currency || 'MXN',
        description: description || `Pago por: ${product.name}`,
        order_id: `ORDER-${Date.now()}`,
        device_session_id: deviceSessionId,
        customer: {
          name: customerName,
          email: customerEmail,
        },
      };

      const openpayUrl = `${this.BaseUrl}/v1/${this.MerchantId}/charges`;

      const response = await axios.post(openpayUrl, chargeData, {
        auth: { username: this.PrivateKey, password: '' },
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      const openpayCharge = response.data;

      chargeToSave = this.buildChargeDtoFromOpenpay(
        openpayCharge,
        product,
        cardToken,
        customerName,
        customerEmail,
        chargeData.description,
      );

      const charge = await this.prisma.charge.create({
        data: {
          id: undefined,
          openpayId: chargeToSave.openpayId,
          product: { connect: { id: product.id } },
          source_id: chargeToSave.source_id,
          amount: chargeToSave.amount,
          currency: chargeToSave.currency,
          status: chargeToSave.status,
          customerId: chargeToSave.customerId,
          customerName: chargeToSave.customerName,
          customerEmail: chargeToSave.customerEmail,
          description: chargeToSave.description,
          creationDate: chargeToSave.creationDate,
          operationDate: chargeToSave.operationDate,
          authorizationCode: chargeToSave.authorizationCode,
        },
      });

      return {
        success: true,
        message: 'Pago procesado exitosamente',
        data: {
          paymentId: charge.id,
          openpayId: charge.openpayId,
          amount: Number(charge.amount),
          currency: charge.currency,
          status: charge.status,
          productId: charge.productId,
          createdAt: charge.createdAt,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const errorData = axiosError.response?.data;

        this.logger.error('Error en Openpay:', errorData);

        chargeToSave = {
          openpayId: `FAIL-${Date.now()}`,
          productId,
          source_id: cardToken,
          amount: product?.price || 0,
          currency: product?.currency || 'MXN',
          status: 'failed',
          customerName,
          customerEmail,
          description: description || 'Intento de pago fallido',
          creationDate: new Date(),
          errorMessage: errorData?.description,
          errorCode: errorData?.error_code,
        };

        await this.prisma.charge
          .create({
            data: {
              openpayId: chargeToSave.openpayId,
              product: product ?? undefined,
              source_id: chargeToSave.source_id,
              amount: chargeToSave.amount,
              currency: chargeToSave.currency,
              status: chargeToSave.status,
              customerName: chargeToSave.customerName,
              customerEmail: chargeToSave.customerEmail,
              description: chargeToSave.description,
              errorMessage: chargeToSave.errorMessage,
              errorCode: chargeToSave.errorCode,
              creationDate: chargeToSave.creationDate,
            },
          })
          .catch((dbError) =>
            this.logger.error('Error al guardar pago fallido:', dbError),
          );

        const errorMessage = this.mapOpenpayError(errorData?.error_code);

        return {
          success: false,
          message: 'Error al procesar el pago',
          error: {
            code: errorData?.error_code || 'PAYMENT_ERROR',
            message:
              errorMessage ||
              errorData?.description ||
              'No se pudo procesar el pago',
          },
        };
      }

      this.logger.error('Error inesperado:', error);
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Error interno al procesar el pago',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildChargeDtoFromOpenpay(
    openpayCharge: any,
    product: any,
    cardToken: string,
    customerName: string,
    customerEmail: string,
    description: string,
  ): ChargeDto {
    return {
      openpayId: openpayCharge.id,
      productId: product.id,
      source_id: cardToken,
      amount: product.price,
      currency: product.currency || 'MXN',
      status: openpayCharge.status,
      customerId: openpayCharge.customer?.id,
      customerName,
      customerEmail,
      description,
      metadata: openpayCharge.metadata,
      creationDate: new Date(openpayCharge.creation_date),
      operationDate: openpayCharge.operation_date
        ? new Date(openpayCharge.operation_date)
        : undefined,
      authorizationCode: openpayCharge.authorization,
    };
  }

  async getChargesByProduct(productId: number) {
    return this.prisma.charge.findMany({
      where: { productId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private mapOpenpayError(errorCode: string): string {
    const errorMap: Record<string, string> = {
      '1000': 'Error interno del servidor de pagos',
      // ... resto de códigos
    };
    return (
      errorMap[errorCode] || 'Error al procesar el pago. Reintenta más tarde.'
    );
  }
}
