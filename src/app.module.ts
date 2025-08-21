import { Module } from '@nestjs/common';
import { CreateCustomerModule } from './apps/create-customer/create-customer.module';
import { LoginModule } from './apps/login/login.module';
import { AuthModule } from './middlewares/auth/auth.module';
import { AppService } from './app.service';
import { ProductsModule } from './apps/products/products.module';


@Module({
  imports: [CreateCustomerModule, LoginModule, AuthModule, ProductsModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
