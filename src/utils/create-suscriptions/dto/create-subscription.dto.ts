import { IsString, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsString()
  source_id: string;

  @ApiPropertyOptional({
    description:
      'Fecha de fin de periodo de prueba (yyyy-mm-dd). Si no se indica se usará trial_days del plan',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsString()
  trial_end_date?: string;
}
