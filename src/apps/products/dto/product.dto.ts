import { IsDecimal, IsInt, IsNotEmpty, IsString, MaxLength, Min, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {

    
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @ApiProperty({example : 'Producto'})
    name : string
    
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @ApiProperty({example : 'Descripcion del producto'})
    description : string
    
    @IsInt()
    @IsNotEmpty()
    @Min(0)
    @ApiProperty({example : 10})
    quantity : number
    
    @IsDecimal({decimal_digits: '2'})
    @ApiProperty({example : "100.00"})    @IsNotEmpty()
    price : string

}