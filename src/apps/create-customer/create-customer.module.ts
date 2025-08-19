import { Module } from '@nestjs/common';
import { CreateCustomerController } from './create-customer.controller';
import { CreateCustomerService } from './create-customer.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  controllers: [CreateCustomerController],
  providers: [CreateCustomerService],
    imports: [PrismaModule],
})
export class CreateCustomerModule {}
