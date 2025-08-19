import { Module } from '@nestjs/common';
import { CreateProductsController } from './create-products.controller';
import { CreateProductsService } from './create-products.service';

@Module({
  controllers: [CreateProductsController],
  providers: [CreateProductsService]
})
export class CreateProductsModule {}
