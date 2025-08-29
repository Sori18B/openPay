import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { CreateChargesService } from './create-charges.service';
import { CreateChargeDto } from './dto/create.charge.dto';
import { ChargeResponseDto } from './dto/response.create.charge.dto';
import { HttpStatus } from '@nestjs/common';

@Controller('create-charges')
export class CreateChargesController {
  constructor(private readonly createChargesService: CreateChargesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createCharge(
    @Body() createChargeDto: CreateChargeDto,
  ): Promise<ChargeResponseDto> {
    return this.createChargesService.createCharge(createChargeDto);
  }

  @Get(':productId')
  async getChargesByProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.createChargesService.getChargesByProduct(productId);
  }
}
