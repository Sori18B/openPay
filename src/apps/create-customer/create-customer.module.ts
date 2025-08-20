import { Module } from '@nestjs/common';
import { CreateCustomerController } from './create-customer.controller';
import { CreateCustomerService } from './create-customer.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { OpenPayModule } from 'src/utils/open-pay/open-pay.module';

@Module({
  controllers: [CreateCustomerController],
  providers: [CreateCustomerService],
  imports: [PrismaModule, OpenPayModule],
})
export class CreateCustomerModule {}
