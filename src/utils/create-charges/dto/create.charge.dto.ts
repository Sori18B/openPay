import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateChargeDto {
  @IsString()
  @IsNotEmpty({ message: 'El token de la tarjeta es requerido' })
  cardToken: string; // Token de la tarjeta generado por Openpay.js en el frontend

  @IsNumber()
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productId: number; // ID del producto a comprar

  @IsString()
  @IsNotEmpty({ message: 'El nombre del cliente es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  customerName: string; // Nombre del cliente

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email del cliente es requerido' })
  customerEmail: string; // Email del cliente

  @IsString()
  @IsOptional()
  @MaxLength(250, { message: 'La descripción no puede exceder 250 caracteres' })
  description?: string; // Descripción opcional del pago

  // Información adicional del dispositivo (para prevención de fraude)
  @IsString()
  @IsNotEmpty({ message: 'El device session ID es requerido' })
  deviceSessionId: string; // ID de sesión del dispositivo (generado por Openpay.js)
}
