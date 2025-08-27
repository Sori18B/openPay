import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { CreateCardsService } from './create-cards.service';
import { CardObjectDto } from './dto/card-dto';

@Controller('create-cards')
export class CreateCardsController {
  constructor(private readonly createCardsService: CreateCardsService) {}

  @Post('/:userId/:addressId')
  async createCard(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() cardDto: CardObjectDto,
  ) {
    return await this.createCardsService.createCard(userId, addressId, cardDto);
  }

  @Get('user/:userId')
  async getUserCards(@Param('userId', ParseIntPipe) userId: number) {
    return await this.createCardsService.getUserCards(userId);
  }
}
