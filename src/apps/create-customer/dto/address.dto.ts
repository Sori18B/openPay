import { 
  IsNotEmpty, 
  IsOptional, 
  IsPostalCode, 
  IsString, 
  Length, 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ example: 'Ciudad de México' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'CDMX' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Av. Reforma #12' })
  @IsString()
  @IsNotEmpty()
  line1: string;

  @ApiProperty({ example: 'Interior 4B', required: false })
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({ example: '72495' })
  @IsPostalCode('any')
  postalCode: string;

  @ApiProperty({ example: 'MX', description: 'Código ISO del país (ej. MX, US, ES)' })
  @IsString()
  @Length(2, 2)
  countryCode: string;
}