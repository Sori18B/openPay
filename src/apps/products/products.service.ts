import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProduct(createProduct: ProductDto) {
    const product = await this.prismaService.product.create({
      data: {
        name: createProduct.name,
        description: createProduct.description,
        quantity: createProduct.quantity,
        imageUrl: createProduct.imageUrl || 'http://imagenexample',
        price: createProduct.price,
        currency: createProduct.currency || 'MXN',
        category: createProduct.category,
        isActive: createProduct.isActive ?? true,
      },
    });

    return { message: 'Product Created Succesfully', success: true, product };
  }

  async getAllProducts() {
    const products = await this.prismaService.product.findMany();

    return products;
  }

  async getProductByID(productId: number) {
    const product = await this.prismaService.product.findFirst({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return { message: 'product not found' };
    }
    return product;
  }
}
