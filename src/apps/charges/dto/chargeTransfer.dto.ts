import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateBankChargeDto {
  @IsNumber()
  @Min(1)
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

  @IsDateString()
  @IsOptional()
  due_date?: string; // Formato YYYY-MM-DD

  @IsNumber()
  @IsNotEmpty()
  customerId: number;
}
