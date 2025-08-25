import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateSuscriptionsService } from './create-suscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('create-suscriptions')
export class CreateSuscriptionsController {
  constructor(
    private readonly createSuscriptionsService: CreateSuscriptionsService,
  ) {}

  @Post()
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
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
