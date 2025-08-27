import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenPayService {
    private client: AxiosInstance;

    constructor(private configService: ConfigService) {
        const merchantId = this.configService.get<string>('OPENPAY_MERCHANT_ID', '');
        const privateKey = this.configService.get<string>('OPENPAY_PRIVATE_KEY', '');
        const isSandbox = this.configService.get<string>('URL_BASE');

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
            throw new Error(`OpenPay Error: ${error.response?.data?.description || error.message}`);
        }
    }

    // Método para obtener customer por ID
    async getCustomer(customerId: string) {
        try {
            const response = await this.client.get(`/customers/${customerId}`);
            return response.data;
        } catch (error) {
            throw new Error(`OpenPay Error: ${error.response?.data?.description || error.message}`);
        }
    }

    // Método para actualizar customer
    async updateCustomer(customerId: string, customerData: any) {
        try {
            const response = await this.client.put(`/customers/${customerId}`, customerData);
            return response.data;
        } catch (error) {
            throw new Error(`OpenPay Error: ${error.response?.data?.description || error.message}`);
        }
    }

    // Método para eliminar customer
    async deleteCustomer(customerId: string) {
        try {
            const response = await this.client.delete(`/customers/${customerId}`);
            return response.data;
        } catch (error) {
            throw new Error(`OpenPay Error: ${error.response?.data?.description || error.message}`);
        }

     
    }

    // ---------------------- Metodos para crear tarjetas ---------------------

    //Método para crear tarjeta
    async createCustomerCard(customerId: string, cardData: any) {
    try {
        const response = await this.client.post(`/customers/${customerId}/cards`, cardData);
        return response.data;
    } catch (error) {
        throw new Error(`OpenPay Error: ${error.response?.data?.description || error.message}`);
    }
    }
}