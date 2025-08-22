import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreatePlanDto } from './dto/plan.dto';

@Injectable()
export class OpenPayService {
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

  // Método público para crear customers
  async createCustomer(customerData: any) {
    try {
      const response = await this.client.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw new Error(
        `OpenPay Error: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // Método para obtener customer por ID
  async getCustomer(customerId: string) {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `OpenPay Error: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // Método para actualizar customer
  async updateCustomer(customerId: string, customerData: any) {
    try {
      const response = await this.client.put(
        `/customers/${customerId}`,
        customerData,
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `OpenPay Error: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // Método para eliminar customer
  async deleteCustomer(customerId: string) {
    try {
      const response = await this.client.delete(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `OpenPay Error: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // ========== MÉTODO PARA CREAR PLANES ==========
  // Crear plan en OpenPay y guardar en base de datos
  async createPlan(createPlanDto: CreatePlanDto) {
    try {
      // 1. Preparar datos para OpenPay
      const planPayload = {
        name: createPlanDto.name,
        amount: createPlanDto.amount,
        currency: createPlanDto.currency || 'MXN',
        repeat_every: createPlanDto.repeatEvery,
        repeat_unit: createPlanDto.repeatUnit,
        retry_times: createPlanDto.retryTimes || 3,
        status_after_retry: createPlanDto.statusAfterRetry || 'cancelled',
        trial_days: createPlanDto.trialDays || 0,
      };

      // 2. Crear plan en OpenPay
      const openPayResponse = await this.client.post('/plans', planPayload);
      const openPayPlan = openPayResponse.data;

      // 3. Guardar plan en base de datos con el status deseado por el usuario
      const savedPlan = await this.prismaService.plan.create({
        data: {
          openpayId: openPayPlan.id,
          creationDate: new Date(openPayPlan.creation_date),
          name: openPayPlan.name,
          amount: parseFloat(openPayPlan.amount),
          currency: openPayPlan.currency,
          repeatEvery: openPayPlan.repeat_every,
          repeatUnit: openPayPlan.repeat_unit,
          retryTimes: openPayPlan.retry_times,
          status: createPlanDto.status || 'active',
          statusAfterRetry: openPayPlan.status_after_retry,
          trialDays: openPayPlan.trial_days,
        },
      });

      return {
        success: true,
        message: 'Plan creado exitosamente',
        openPayData: openPayPlan,
        planId: savedPlan.id,
        plan: savedPlan,
      };
    } catch (error) {
      console.error('Error creando plan:', error);
      throw new Error(
        `Error creando plan: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // ========== MÉTODOS PARA LISTAR PLANES ==========
  // Obtener planes activos para el frontend
  async getActivePlans() {
    try {
      // Obtener planes activos de la base de datos
      const dbPlans = await this.prismaService.plan.findMany({
        where: { status: 'active' },
        orderBy: { creationDate: 'desc' }, // Ordenar por fecha de creación descendente
      });

      const formattedPlans = dbPlans.map((plan) => ({
        name: plan.name,
        status: plan.status,
        amount: Number(plan.amount), // Convertir Decimal a number
        currency: plan.currency,
        idopenpay: plan.openpayId, // Este es el ID que usa OpenPay
        creation_date: plan.creationDate.toISOString(),
        repeat_every: plan.repeatEvery,
        repeat_unit: plan.repeatUnit,
        retry_times: plan.retryTimes,
        status_after_retry: plan.statusAfterRetry,
        trial_days: plan.trialDays,
      }));

      return formattedPlans;
    } catch (error) {
      console.error('Error obteniendo planes activos:', error);
      throw new Error(`Error obteniendo planes activos: ${error.message}`);
    }
  }
}
