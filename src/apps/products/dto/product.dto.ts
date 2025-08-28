import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({ example: 'Producto' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({ example: 'Descripcion del producto' })
  description: string;

  @ApiProperty({ example: 'La UrL de la imagen' })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty({ example: 10 })
  quantity: number;

  @IsDecimal({ decimal_digits: '2' })
  @ApiProperty({ example: 100.0 })
  @IsNotEmpty()
  @Min(0.5, { message: 'El precuo debe de ser mayor a 0' })
  price: number;

  @ApiProperty({ example: 'MXN' })
  @IsOptional()
  @IsString()
  currency?: string = 'MXN';

  @ApiProperty({ example: 'Ropa' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
