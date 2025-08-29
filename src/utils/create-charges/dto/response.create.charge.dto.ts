export class ChargeResponseDto {
  success: boolean;
  message: string;
  data?: {
    paymentId: string; // UUID
    openpayId: string;
    amount: number;
    currency: string;
    status: string;
    productId: number;
    createdAt: Date;
  };
  error?: {
    code: string;
    message: string;
  };
}
