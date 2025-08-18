import { Module } from '@nestjs/common';
import { CreateCustomerController } from './create-customer.controller';
import { CreateCustomerService } from './create-customer.service';

@Module({
  controllers: [CreateCustomerController],
  providers: [CreateCustomerService]
})
export class CreateCustomerModule {}
