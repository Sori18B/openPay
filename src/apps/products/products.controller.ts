import { Controller, Post, Body, Get, Param} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';

@Controller('product')
export class ProductsController {
    constructor(private productsService: ProductsService){}
    
    @Post()
    async createProduct(@Body() newProduct: ProductDto) {
        return await this.productsService.createProduct(newProduct)
    }

    @Get()
    async getAllProducts() {
        return await this.productsService.getAllProducts()
    }
    

    @Get('/:id')
    async getProductById (@Param('id') productId: number){
        return await this.productsService.getProductByID(productId)
    }
    

}
