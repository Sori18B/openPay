import { Module } from '@nestjs/common';
import { CreateCustomerModule } from './apps/create-customer/create-customer.module';
import { LoginModule } from './apps/login/login.module';
import { AuthModule } from './middlewares/auth/auth.module';
<<<<<<< HEAD
=======
import { CreateProductsModule } from './apps/create-products/create-products.module';
import { OpenPayModule } from './utils/open-pay/open-pay.module';
import { CreateSuscriptionsModule } from './utils/create-suscriptions/create-suscriptions.module';
>>>>>>> b6c6203dbe7d645e43944824bec727d68a1fab97
import { AppService } from './app.service';
import { ProductsModule } from './apps/products/products.module';

@Module({
<<<<<<< HEAD
  imports: [CreateCustomerModule, LoginModule, AuthModule, ProductsModule],
=======
  imports: [
    CreateCustomerModule,
    LoginModule,
    AuthModule,
    CreateProductsModule,
    OpenPayModule,
    CreateSuscriptionsModule,
  ],
>>>>>>> b6c6203dbe7d645e43944824bec727d68a1fab97
  controllers: [],
  providers: [AppService],
})
export class AppModule {}

// llamen a dios 