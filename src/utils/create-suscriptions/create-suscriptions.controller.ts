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

  @Post(':customerId')
  async createSubscription(
    @Param('customerId') customerId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    return this.createSuscriptionsService.createSubscription(
      createSubscriptionDto,
      customerId,
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
