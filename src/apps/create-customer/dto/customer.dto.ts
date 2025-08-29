
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPostalCode,
  IsString,
  IsStrongPassword,
  Length,
  ValidateNested,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '1990-05-10',
    description: 'Fecha de nacimiento (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthDate: Date;

  @ApiProperty({
    example: 'juan.perez@email.com',
    description: 'Correo electrónico válido',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPassword#123.',
    description: 'Contraseña segura',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '+525512345678',
    description: 'Teléfono en formato internacional',
  })
  @IsPhoneNumber('MX')
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ type: () => AddressDto, description: 'Dirección del cliente' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
