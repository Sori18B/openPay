import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateCustomerModule } from './create-customer/create-customer.module';
import { CreateCustomerModule } from './create-customer/create-customer.module';

@Module({
  imports: [CreateCustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
