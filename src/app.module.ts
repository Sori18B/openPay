import { Module } from '@nestjs/common';
import { CreateCustomerModule } from './apps/create-customer/create-customer.module';
import { LoginModule } from './apps/login/login.module';
import { AuthModule } from './middlewares/auth/auth.module';
import { CreateProductsModule } from './apps/create-products/create-products.module';
import { OpenPayModule } from './utils/open-pay/open-pay.module';
import { CreateSuscriptionsModule } from './utils/create-suscriptions/create-suscriptions.module';
import { AppService } from './app.service';

@Module({
  imports: [
    CreateCustomerModule,
    LoginModule,
    AuthModule,
    CreateProductsModule,
    OpenPayModule,
    CreateSuscriptionsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}

// llamen a dios 