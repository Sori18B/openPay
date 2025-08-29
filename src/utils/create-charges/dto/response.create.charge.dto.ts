// DTO para la respuesta del pago
export class ChargeResponseDto {
  success: boolean;
  message: string;
  data?: {
    paymentId: string;
    openpayId: string;
    amount: number;
    currency: string;
    status: string;
    productName: string;
    createdAt: Date;
  };
  error?: {
    code: string;
    message: string;
  };
}
