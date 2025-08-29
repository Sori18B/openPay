import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCardChargeDto {
  @IsString()
  @IsNotEmpty()
  source_id: string; // Token de tarjeta generado por Openpay JS

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'MXN';

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  order_id?: string;

  @IsString()
  @IsOptional()
  device_session_id?: string; // Sesión de dispositivo

  @IsNumber()
  @IsNotEmpty()
  customerId: number;
}
