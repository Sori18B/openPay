import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class CreateSuscriptionsService {
  private client: AxiosInstance;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    const merchantId = this.configService.get<string>(
      'OPENPAY_MERCHANT_ID',
      '',
    );
    const privateKey = this.configService.get<string>(
      'OPENPAY_PRIVATE_KEY',
      '',
    );
    const isSandbox =
      this.configService.get<string>('OPENPAY_ENV') === 'sandbox';

    if (!merchantId || !privateKey) {
      throw new Error('Openpay credentials are missing');
    }

    const baseURL = isSandbox
      ? `https://sandbox-api.openpay.mx/v1/${merchantId}`
      : `https://api.openpay.mx/v1/${merchantId}`;

    this.client = axios.create({
      baseURL,
      auth: { username: privateKey, password: '' },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ========== CREAR SUSCRIPCIÓN ==========
  async createSubscription(createSubscriptionDto: CreateSubscriptionDto) {
    try {
      // 1. Verificar que el usuario existe
      const user = await this.prismaService.users.findUnique({
        where: { id: createSubscriptionDto.userId },
        include: {
          subscriptions: {
            where: { status: { not: 'cancelled' } }, // Solo obtener suscripciones activas
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // 2. Obtener el customerId del usuario
      const customerId = user.openPayCustomerId;

      // 3. Verificar que el usuario no tenga una suscripción activa
      if (user.subscriptions && user.subscriptions.length > 0) {
        throw new ConflictException(
          'El usuario ya tiene una suscripción activa',
        );
      }

      // 4. Verificar que el plan existe
      const plan = await this.prismaService.plan.findFirst({
        where: { openpayId: createSubscriptionDto.plan_id },
      });

      if (!plan) {
        throw new NotFoundException('Plan no encontrado');
      }

      // 5. Validar que se envíe source_id o card (uno de los dos es requerido)
      if (!createSubscriptionDto.source_id && !createSubscriptionDto.card) {
        throw new Error('Debe enviar source_id o card');
      }

      if (createSubscriptionDto.source_id && createSubscriptionDto.card) {
        throw new Error('No puede enviar source_id y card al mismo tiempo');
      }

      // 6. Preparar datos para OpenPay
      const subscriptionPayload: any = {
        plan_id: createSubscriptionDto.plan_id,
        ...(createSubscriptionDto.trial_end_date && {
          trial_end_date: createSubscriptionDto.trial_end_date,
        }),
      };

      // Agregar source_id o card según lo que se haya enviado
      if (createSubscriptionDto.source_id) {
        subscriptionPayload.source_id = createSubscriptionDto.source_id;
      } else if (createSubscriptionDto.card) {
        subscriptionPayload.card = createSubscriptionDto.card;
        // Agregar device_session_id si está presente en la tarjeta para prevención de fraudes
        if (createSubscriptionDto.card.device_session_id) {
          subscriptionPayload.device_session_id =
            createSubscriptionDto.card.device_session_id;
        }
      }

      // 7. Crear suscripción en OpenPay
      const openPayResponse = await this.client.post(
        `/customers/${customerId}/subscriptions`,
        subscriptionPayload,
      );
      const openPaySubscription = openPayResponse.data;

      // 8. Guardar suscripción en base de datos
      const savedSubscription = await this.prismaService.subscription.create({
        data: {
          openpayId: openPaySubscription.id,
          creationDate: new Date(openPaySubscription.creation_date),
          cancelAtPeriodEnd: openPaySubscription.cancel_at_period_end,
          chargeDate: new Date(openPaySubscription.charge_date),
          currentPeriodNumber: openPaySubscription.current_period_number,
          periodEndDate: new Date(openPaySubscription.period_end_date),
          trialEndDate: openPaySubscription.trial_end_date
            ? new Date(openPaySubscription.trial_end_date)
            : null,
          planId: openPaySubscription.plan_id,
          status: openPaySubscription.status,
          customerId: openPaySubscription.customer_id,
          card: openPaySubscription.card,
          userId: createSubscriptionDto.userId,
        },
      });

      // 9. Actualizar campo subscription del usuario a true
      await this.prismaService.users.update({
        where: { id: createSubscriptionDto.userId },
        data: { subscription: true },
      });

      return {
        success: true,
        message: 'Suscripción creada exitosamente',
        subscription: savedSubscription,
        openPayData: openPaySubscription,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(
        `Error creando suscripción: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // ========== CANCELAR SUSCRIPCIÓN ==========
  async cancelSubscription(subscriptionId: string) {
    try {
      // 1. Buscar suscripción en base de datos
      const subscription = await this.prismaService.subscription.findUnique({
        where: { id: subscriptionId },
        include: { user: true },
      });

      if (!subscription) {
        throw new NotFoundException('Suscripción no encontrada');
      }

      try {
        // 2. Intentar cancelar en OpenPay
        await this.client.delete(
          `/customers/${subscription.customerId}/subscriptions/${subscription.openpayId}`,
        );
      } catch (openPayError) {
        // Si la suscripción no existe en OpenPay (404), continúa para limpiar la DB
        if (openPayError.response?.status !== 404) {
          throw openPayError;
        }
      }

      // 3. Actualizar estado en base de datos
      const updatedSubscription = await this.prismaService.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'cancelled',
          updatedAt: new Date(),
        },
      });

      // 4. Actualizar campo subscription del usuario a false solo si no tiene otras suscripciones activas
      const remainingActiveSubscriptions =
        await this.prismaService.subscription.count({
          where: {
            userId: subscription.userId,
            status: { not: 'cancelled' },
            id: { not: subscriptionId }, // Excluir la suscripción que acabamos de cancelar
          },
        });

      if (remainingActiveSubscriptions === 0) {
        await this.prismaService.users.update({
          where: { id: subscription.userId },
          data: { subscription: false },
        });
      }

      return {
        success: true,
        message: 'Suscripción cancelada exitosamente',
        subscription: updatedSubscription,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Error cancelando suscripción: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // ========== OBTENER SUSCRIPCIONES DE USUARIO ==========
  async getUserSubscriptions(userId: number) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            include: {
              plan: true,
            },
            orderBy: { createdAt: 'desc' }, // Más recientes primero
          },
        },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Buscar suscripción activa (solo puede haber una)
      const activeSubscription = user.subscriptions.find(
        (sub) => sub.status !== 'cancelled',
      );

      return {
        success: true,
        hasActiveSubscription: !!activeSubscription,
        activeSubscription: activeSubscription || null,
        subscriptionHistory: user.subscriptions, // Historial completo
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error obteniendo suscripciones: ${error.message}`);
    }
  }
}
