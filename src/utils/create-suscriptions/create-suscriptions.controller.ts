import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
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

  @Delete(':subscriptionId')
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.createSuscriptionsService.cancelSubscription(subscriptionId);
  }
}
