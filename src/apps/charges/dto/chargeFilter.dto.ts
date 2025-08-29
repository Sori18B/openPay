import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ChargeFilterDto {
  @ApiPropertyOptional({ description: 'ID del producto' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'Estado del cargo' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Email del cliente' })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Límite de resultados', default: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset para paginación', default: 0 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  offset?: number;
}
