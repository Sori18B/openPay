import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddressDto } from 'src/apps/create-customer/dto/address.dto';

export class CardObjectDto {
  @ApiProperty({ example: '4111111111111111' })
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @ApiProperty({ example: 'Juan Perez Ramirez' })
  @IsString()
  @IsNotEmpty()
  holder_name: string;

  @ApiProperty({ example: '20' })
  @IsString()
  @IsNotEmpty()
  expiration_year: string;

  @ApiProperty({ example: '12' })
  @IsString()
  @IsNotEmpty()
  expiration_month: string;

  @ApiProperty({ example: '110' })
  @IsString()
  @IsNotEmpty()
  cvv2: string;

  @ApiProperty({ example: 'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  device_session_id: string;
}
