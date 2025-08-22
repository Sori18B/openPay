import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChargesService } from './charges.service';
import { CreateCardChargeDto } from './dto/chargeCard.dto';
import { CreateBankChargeDto } from './dto/chargeTransfer.dto';

@Controller('charges')
export class ChargesController {
  constructor(private readonly chargeService: ChargesService) {}

  @Post('/card')
  async createCardCharge(@Body() dto: CreateCardChargeDto) {
    return await this.chargeService.createCardCharge(dto);
  }

  @Post('/transaction')
  async createBankCharge(@Body() dto: CreateBankChargeDto) {
    return await this.chargeService.createBankCharge(dto);
  }

  @Get('transaction/:id')
  async getTransactionStatus(@Param('id') id: string) {
    return await this.chargeService.getTransactionStatus(id);
  }
}
