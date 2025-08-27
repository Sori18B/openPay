import { IsString, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CardDto {
  @ApiProperty({
    description: 'Número de tarjeta',
    example: '4111111111111111',
  })
  @IsString()
  card_number: string;

  @ApiProperty({
    description: 'Nombre del titular',
    example: 'Juan Perez Ramirez',
  })
  @IsString()
  holder_name: string;

  @ApiProperty({
    description: 'Año de expiración (2 dígitos)',
    example: '25',
  })
  @IsString()
  expiration_year: string;

  @ApiProperty({
    description: 'Mes de expiración (2 dígitos)',
    example: '12',
  })
  @IsString()
  expiration_month: string;

  @ApiProperty({
    description: 'Código de seguridad',
    example: '110',
  })
  @IsString()
  cvv2: string;

  @ApiPropertyOptional({
    description: 'ID de sesión de dispositivo para antifraude',
  })
  @IsOptional()
  @IsString()
  device_session_id?: string;
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'ID del plan en OpenPay al que se suscribe el usuario',
    example: 'po2szvypn8mi1odp4cri',
  })
  @IsString()
  plan_id: string;

  @ApiProperty({
    description: 'ID del usuario que se va a suscribir',
    example: 1,
  })
  @IsInt()
  userId: number;

  @ApiPropertyOptional({
    description:
      'ID de la tarjeta/token previamente registrado en OpenPay (requerido si no se envía card)',
    example: 'ktrpvymgatocelsciak7',
  })
  @IsOptional()
  @IsString()
  source_id?: string;

  @ApiPropertyOptional({
    description: 'Datos de la tarjeta (requerido si no se envía source_id)',
    type: CardDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardDto)
  card?: CardDto;

  @ApiPropertyOptional({
    description:
      'Fecha de fin de periodo de prueba (yyyy-mm-dd). Si no se indica se usará trial_days del plan',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsString()
  trial_end_date?: string;
}
