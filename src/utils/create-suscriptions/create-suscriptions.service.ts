import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class CreateSubscriptionsService {
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
      throw new Error('OpenPay credentials are missing');
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

  // ========== CREAR SUSCRIPCIÓN CON SOURCE_ID ==========
  async createSubscription(dto: CreateSubscriptionDto) {
    try {
      // 1. Verificar que el usuario existe
      const user = await this.prismaService.users.findUnique({
        where: { id: dto.userId },
        include: {
          subscriptions: {
            where: { status: { not: 'cancelled' } },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      // 2. Verificar que el usuario no tenga suscripción activa
      if (user.subscriptions && user.subscriptions.length > 0) {
        throw new ConflictException(
          'El usuario ya tiene una suscripción activa',
        );
      }

      // 3. Verificar que el plan existe
      const plan = await this.prismaService.plan.findFirst({
        where: { openpayId: dto.plan_id },
      });
      if (!plan) throw new NotFoundException('Plan no encontrado');

      // 4. Validar que se envíe source_id
      if (!dto.source_id) {
        throw new Error('Debe enviar source_id');
      }

      // 5. Preparar payload para OpenPay
      const payload: any = {
        plan_id: dto.plan_id,
        source_id: dto.source_id,
        ...(dto.trial_end_date && { trial_end_date: dto.trial_end_date }),
      };

      // 6. Crear suscripción en OpenPay
      const openPayResponse = await this.client.post(
        `/customers/${user.openPayCustomerId}/subscriptions`,
        payload,
      );
      const openPaySubscription = openPayResponse.data;

      // 7. Guardar suscripción en BD
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
          userId: dto.userId,
        },
      });

      // 8. Marcar al usuario con suscripción activa
      await this.prismaService.users.update({
        where: { id: dto.userId },
        data: { subscription: true },
      });

      return {
        success: true,
        message: 'Suscripción creada exitosamente',
        subscription: savedSubscription,
        openPayData: openPaySubscription,
      };
    } catch (error: any) {
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
      const subscription = await this.prismaService.subscription.findUnique({
        where: { id: subscriptionId },
        include: { user: true },
      });
      if (!subscription)
        throw new NotFoundException('Suscripción no encontrada');

      try {
        await this.client.delete(
          `/customers/${subscription.customerId}/subscriptions/${subscription.openpayId}`,
        );
      } catch (openPayError) {
        if (openPayError.response?.status !== 404) throw openPayError;
      }

      const updatedSubscription = await this.prismaService.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'cancelled', updatedAt: new Date() },
      });

      const remainingActiveSubscriptions =
        await this.prismaService.subscription.count({
          where: {
            userId: subscription.userId,
            status: { not: 'cancelled' },
            id: { not: subscriptionId },
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
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
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
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      const activeSubscription = user.subscriptions.find(
        (sub) => sub.status !== 'cancelled',
      );

      return {
        success: true,
        hasActiveSubscription: !!activeSubscription,
        activeSubscription: activeSubscription || null,
        subscriptionHistory: user.subscriptions,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Error obteniendo suscripciones: ${error.message}`);
    }
  }
}
