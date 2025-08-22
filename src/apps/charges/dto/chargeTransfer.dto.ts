import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateBankChargeDto {
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
  @IsOptional()
  order_id?: string; 

  @IsString()
  @IsOptional()
  due_date?: string; // Fecha de vencimiento (YYYY-MM-DD)
}