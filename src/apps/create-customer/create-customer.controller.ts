import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateCustomerService } from './create-customer.service';
import { CreateCustomerDto } from './dto/customer.dto';

@Controller('create-customer')
export class CreateCustomerController {
    constructor(private createCustomerService: CreateCustomerService){}

  @Post('/openPayClient')
  async createopenPayClient(@Body() dto: CreateCustomerDto) {
    return await this.createCustomerService.createCustomer(dto)
  }

  @Get('/:id')
  async getUserById(@Param('id') user_id : number){
    return await this.createCustomerService.getUserById(user_id)
  }
}
