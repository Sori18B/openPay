import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChargesService } from './charges.service';
import { CreateCardChargeDto } from './dto/chargeCard.dto';
import { CreateBankChargeDto } from './dto/chargeTransfer.dto';

@Controller('charges')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChargesController {
  constructor(private readonly chargeService: ChargesService) {}

  /**
   * Crear cargo con tarjeta de crédito/débito
   * POST /charges/card
   */
  @Post('/card')
  @HttpCode(HttpStatus.CREATED)
  async createCardCharge(@Body() dto: CreateCardChargeDto) {
    return await this.chargeService.createCardCharge(dto);
  }

  /**
   * Crear cargo con transferencia bancaria/SPEI
   * POST /charges/bank-transfer
   */
  @Post('/bank-transfer')
  @HttpCode(HttpStatus.CREATED)
  async createBankCharge(@Body() dto: CreateBankChargeDto) {
    return await this.chargeService.createBankCharge(dto);
  }

  /**
   * Obtener estado de una transacción específica
   * GET /charges/transaction/:id
   */
  @Get('/transaction/:id')
  async getTransactionStatus(@Param('id') id: string) {
    return await this.chargeService.getTransactionStatus(id);
  }

  /**
   * Obtener transacciones de un cliente
   * GET /charges/customer/:customerId/transactions
   */
  @Get('/customer/:customerId/transactions')
  async getCustomerTransactions(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.chargeService.getCustomerTransactions(
      customerId,
      page,
      limit,
    );
  }

  /**
   * Webhook para recibir notificaciones de Openpay
   * POST /charges/webhook
   */
  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: any) {
    return await this.chargeService.handleWebhook(webhookData);
  }
}
