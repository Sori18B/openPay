import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDecimal,
  IsOptional,
  IsUUID,
  IsEmail,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChargeDto {
  @ApiProperty({
    example: 'uuid-de-la-transaccion',
    description: 'ID de la transacción en Openpay',
  })
  @IsString()
  @IsNotEmpty()
  openpayId: string;

  @ApiProperty({ example: 1, description: 'ID del producto asociado' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    example: 'tok_5b0b2e84d470d06852a',
    description: 'Token de la tarjeta (opcional)',
  })
  @IsString()
  @IsOptional()
  source_id?: string;

  @ApiProperty({ example: 150.75, description: 'Monto de la transacción' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'MXN',
    description: 'Moneda de la transacción',
    default: 'MXN',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    example: 'pending',
    description: 'Estado de la transacción (pending, completed, failed)',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: 'cus_5b0b2e84d470d06852b',
    description: 'ID del cliente en Openpay (opcional)',
  })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre del cliente' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Correo del cliente',
  })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({
    example: 'Compra de producto X',
    description: 'Descripción de la transacción',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: { orderId: 12345 },
    description: 'Metadatos adicionales de la transacción',
  })
  @IsOptional()
  metadata?: JSON;

  @ApiProperty({
    example: '2025-08-29T10:00:00Z',
    description: 'Fecha de creación de la transacción',
  })
  @IsString()
  @IsNotEmpty()
  creationDate: Date;

  @ApiProperty({
    example: '2025-08-29T10:05:00Z',
    description: 'Fecha en que se completó la operación (opcional)',
  })
  @IsString()
  @IsOptional()
  operationDate?: Date;

  @ApiProperty({
    example: 'Tarjeta declinada',
    description: 'Mensaje de error (si aplica)',
  })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({
    example: '3001',
    description: 'Código de error de Openpay (si aplica)',
  })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiProperty({
    example: '123456',
    description: 'Código de autorización de la transacción',
  })
  @IsString()
  @IsOptional()
  authorizationCode?: string;
}
