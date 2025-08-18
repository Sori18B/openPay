import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsPhoneNumber, 
  IsPostalCode, 
  IsString, 
  Length, 
  ValidateNested 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'juan.perez@email.com', description: 'Correo electrónico válido' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+525512345678', description: 'Teléfono en formato internacional' })
  @IsPhoneNumber('MX') 
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ type: () => AddressDto, description: 'Dirección del cliente' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

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

  @ApiProperty({ example: '06000' })
  @IsPostalCode('MX')
  postalCode: string;

  @ApiProperty({ example: 'MX', description: 'Código ISO del país (ej. MX, US, ES)' })
  @IsString()
  @Length(2, 2)
  countryCode: string;
}
