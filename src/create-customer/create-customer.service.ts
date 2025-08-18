import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/customer.dto';


@Injectable()
export class CreateCustomerService {
    Openpay = require('openpay');
    
    createCustomer(){
        this.Openpay.customers.create(CreateCustomerDto, function(error, body, response){
            error;
            body;
            response;
        });


    }

}
