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

    // Declaramos 'chargeToSave' fuera del try-catch para poder usarlo en el catch
    let chargeToSave: ChargeDto;
    let product;

    try {
      // Paso 1: Buscar el producto en la base de datos
      this.logger.log(`Buscando producto con ID: ${productId}`);
      product = await this.prisma.product.findUnique({
        where: {
          id: productId,
          isActive: true, // Cambié 'active' por 'isActive' para que coincida con tu DTO de Product
        },
      });

      // Paso 2: Validar que el producto existe
      if (!product) {
        this.logger.error(`Producto no encontrado: ${productId}`);
        throw new HttpException(
          'El producto solicitado no existe o no está disponible',
          HttpStatus.NOT_FOUND,
        );
      }

      // Paso 3: Preparar los datos para el cargo en Openpay
      const chargeData = {
        source_id: cardToken,
        method: 'card',
        amount: Number(product.price), // Openpay requiere un number, no un Decimal de Prisma
        currency: product.currency || 'MXN',
        description: description || `Pago por: ${product.name}`,
        order_id: `ORDER-${Date.now()}`,
        device_session_id: deviceSessionId,
        customer: {
          name: customerName,
          email: customerEmail,
        },
      };

      this.logger.log('Enviando cargo a Openpay...');

      // Paso 4: Realizar la petición HTTP a Openpay
      const openpayUrl = `${this.BaseUrl}/v1/${this.MerchantId}/charges`;
      const response = await axios.post(openpayUrl, chargeData, {
        auth: {
          username: this.PrivateKey,
          password: '',
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      // Paso 5: Procesar respuesta exitosa de Openpay
      const openpayCharge = response.data;
      this.logger.log(`Cargo exitoso en Openpay: ${openpayCharge.id}`);

      // Paso 6: Crear el DTO de Charge con los datos del pago exitoso
      chargeToSave = {
        openpayId: openpayCharge.id,
        productId: product.id,
        source_id: cardToken,
        amount: product.price, // Prisma maneja el tipo Decimal
        currency: product.currency || 'MXN',
        status: openpayCharge.status, // Usa el status de Openpay
        customerId: openpayCharge.customer.id, // Si Openpay devuelve el ID de cliente
        customerName,
        customerEmail,
        description: chargeData.description,
        metadata: openpayCharge.metadata,
        creationDate: new Date(openpayCharge.creation_date),
        operationDate: new Date(openpayCharge.operation_date),
        authorizationCode: openpayCharge.authorization,
      };

      // Paso 7: Guardar el DTO en la base de datos (se usa el modelo Charge)
      const charge = await this.prisma.charge.create({
        data: {
          ...chargeToSave,
          creationDate: new Date(chargeToSave.creationDate),
          operationDate: chargeToSave.operationDate
            ? new Date(chargeToSave.operationDate)
            : null,
        },
        include: {
          product: true,
        },
      });

      // Paso 8: Retornar respuesta exitosa
      return {
        success: true,
        message: 'Pago procesado exitosamente',
        data: {
          paymentId: charge.id,
          openpayId: charge.openpayId,
          amount: Number(charge.amount),
          currency: charge.currency,
          status: charge.status,
          createdAt: charge.createdAt,
        },
      };
    } catch (error) {
      // Manejo de errores de Openpay
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        const errorData = axiosError.response?.data;

        this.logger.error('Error en Openpay:', errorData);

        // Crear el DTO de Charge con los datos del pago fallido
        chargeToSave = {
          openpayId: `FAIL-${Date.now()}`,
          productId,
          amount: product ? product.price : 0,
          currency: product ? product.currency || 'MXN' : 'MXN',
          status: 'failed',
          errorMessage: errorData?.description || 'Error al procesar el pago',
          errorCode: errorData?.error_code || 'UNKNOWN_ERROR',
          description: description || 'Intento de pago fallido',
          customerName,
          customerEmail,
          creationDate: new Date(),
          source_id: cardToken,
        };

        // Guardar el intento de pago fallido en la base de datos
        try {
          await this.prisma.charge.create({
            data: {
              ...chargeToSave,
              creationDate: new Date(chargeToSave.creationDate),
            },
          });
        } catch (dbError) {
          this.logger.error('Error al guardar pago fallido:', dbError);
        }

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

      // Manejo de otros errores
      this.logger.error('Error inesperado:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Error interno al procesar el pago',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Métodos mapOpenpayError, getPaymentsByProduct, getPaymentDetails...
  // ... estos métodos se mantienen iguales, solo cambia la referencia de 'payment' a 'charge'

  /**
   * Obtener historial de cargos de un producto
   * @param productId - ID del producto
   * @returns Lista de cargos del producto
   */
  async getChargesByProduct(productId: number) {
    // Cambié string a number
    return this.prisma.charge.findMany({
      where: { productId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private mapOpenpayError(errorCode: string): string {
    const errorMap: Record<string, string> = {
      '1000': 'Error interno del servidor de pagos',
      '1001': 'Formato de la petición no válido',
      '1002': 'El comercio no está activo',
      '1003': 'Operación no permitida',
      '1004': 'Fondos insuficientes',
      '1005': 'Límite de transacciones excedido',
      '2001': 'La cuenta de banco del cliente no existe',
      '2003': 'El cliente no existe',
      '2004': 'La tarjeta ha expirado',
      '2005': 'La tarjeta ha sido rechazada',
      '2006': 'El CVV2 de la tarjeta no es válido',
      '2007': 'La tarjeta no soporta transacciones en línea',
      '2008': 'La tarjeta es reportada como perdida',
      '2009': 'La tarjeta es reportada como robada',
      '2010': 'El banco ha restringido la tarjeta',
      '2011': 'El banco ha solicitado que la tarjeta sea retenida',
      '3001': 'La tarjeta fue declinada por el banco',
      '3002': 'La tarjeta ha expirado',
      '3003': 'La tarjeta no tiene fondos suficientes',
      '3004': 'La tarjeta ha sido rechazada',
      '3005': 'La tarjeta ha sido rechazada por el sistema antifraude',
      '3006': 'La operación no está permitida para este tipo de tarjeta',
      '3008': 'La tarjeta no es soportada en transacciones en línea',
      '3009': 'La tarjeta fue reportada como perdida',
      '3010': 'El banco ha restringido la tarjeta',
      '3011': 'El banco ha solicitado que la tarjeta sea retenida',
      '3012':
        'Se requiere autorización del banco para realizar esta transacción',
    };

    return (
      errorMap[errorCode] ||
      'Error al procesar el pago. Por favor, verifica los datos e intenta nuevamente.'
    );
  }
}
