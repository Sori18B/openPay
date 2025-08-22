import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCardChargeDto {
  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  currency?: string = 'MXN';

  @IsString()
  @IsNotEmpty()
  customerId: string; 

  @IsString()
  @IsNotEmpty()
  source_id: string; // Token de tarjeta generado por Openpay JS

  @IsString()
  @IsOptional()
  device_session_id?: string; // Sesión de dispositivo

  @IsString()
  @IsOptional()
  order_id?: string; 
}