import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProductDto } from './dto/product.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
    constructor (private readonly prismaService: PrismaService) {}

    async createProduct (newProduct : ProductDto) {
        const productData = {
            ...newProduct,
            price: new Decimal(newProduct.price)
        }

        await this.prismaService.product.create({data:productData})
        return {message : 'Product Created Succesfully'}
    }

    async getAllProducts() {
        const products = await this.prismaService.product.findMany()

        return products;
    }

    async getProductByID(productId : number) {
        const product = await this.prismaService.product.findFirst()
        
        if(!product) {
            return {message : 'product not found'}
        }
        return product;
    }

}
