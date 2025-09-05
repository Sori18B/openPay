import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateSubscriptionsService } from './create-suscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('create-suscriptions')
export class CreateSuscriptionsController {
  constructor(
    private readonly createSuscriptionsService: CreateSubscriptionsService,
  ) {}

  @Post()
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    console.log('Controlador:', createSubscriptionDto);
    return this.createSuscriptionsService.createSubscription(
      createSubscriptionDto,
    );
  }

  @Get('user/:userId')
  async getUserSubscriptions(@Param('userId', ParseIntPipe) userId: number) {
    return this.createSuscriptionsService.getUserSubscriptions(userId);
  }

  @Delete(':subscriptionId')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.createSuscriptionsService.cancelSubscription(subscriptionId);
  }
}
