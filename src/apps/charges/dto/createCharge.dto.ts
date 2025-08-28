import {
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCustomerDto } from 'src/apps/create-customer/dto/customer.dto';
import { CardObjectDto } from 'src/apps/create-cards/dto/card-dto';

export class CreateChargeDto {
  @ApiProperty({ example: 1, description: 'ID del producto a comprar' })
  @IsNumber()
  @Min(1, { message: 'El ID del producto debe ser mayor a 0' })
  productId: number;

  @ApiProperty({
    example: 'card',
    description: 'Método de pago',
    enum: ['card', 'bank_account', 'store'],
  })
  @IsString()
  method: 'card' | 'bank_account' | 'store';

  @ApiProperty({
    type: () => CreateCustomerDto,
    description: 'Datos del cliente',
  })
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer: CreateCustomerDto;

  @ApiProperty({
    type: () => CardObjectDto,
    description: 'Datos de la tarjeta (requerido si method es card)',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardObjectDto)
  card?: CardObjectDto;

  @ApiProperty({
    example: 'Compra de curso online',
    description: 'Descripción del cargo',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'ORDER-2024-001',
    description: 'ID de orden personalizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  order_id?: string;

  @ApiProperty({
    example: { curso: 'nestjs', descuento: '10%' },
    description: 'Metadatos adicionales',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
