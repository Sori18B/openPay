import { IsString, IsNumber, IsInt, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
    @IsString()
    @ApiProperty({ 
        example: 'Plan VIP Mensual', 
        description: 'Nombre del Plan' 
    })
    name: string;

    @IsNumber()
    @ApiProperty({ 
        example: 299.99, 
        description: 'Monto que se aplicará cada vez que se cobre la suscripción. Debe ser mayor a cero, con hasta 2 dígitos decimales' 
    })
    amount: number;

    @IsOptional()
    @IsString()
    @ApiProperty({ 
        example: 'MXN', 
        description: 'Moneda usada en la operación, por default es MXN',
        default: 'MXN'
    })
    currency?: string;

    @IsInt()
    @ApiProperty({ 
        example: 1, 
        description: 'Número de unidades tiempo entre los que se cobrará la suscripción. Por ejemplo, repeat_unit=month y repeat_every=2 indica que se cobrará cada 2 meses' 
    })
    repeatEvery: number;

    @IsString()
    @IsIn(['week', 'month', 'year'])
    @ApiProperty({ 
        example: 'month', 
        description: 'Especifica la frecuencia de cobro',
        enum: ['week', 'month', 'year']
    })
    repeatUnit: string;

    @IsOptional()
    @IsInt()
    @ApiProperty({ 
        example: 3, 
        description: 'Número de reintentos de cobro de la suscripción. Cuando se agotan los intentos se pone en el estatus determinado por status_after_retry',
        default: 3
    })
    retryTimes?: number;

    @IsOptional()
    @IsString()
    @IsIn(['unpaid', 'cancelled'])
    @ApiProperty({ 
        example: 'cancelled', 
        description: 'Este campo especifica el status en el que se pondrá la suscripción una vez que se agotaron los intentos',
        enum: ['unpaid', 'cancelled'],
        default: 'cancelled'
    })
    statusAfterRetry?: string;

    @IsOptional()
    @IsInt()
    @ApiProperty({ 
        example: 7, 
        description: 'Número de días de prueba por defecto que tendrá la suscripción',
        default: 0
    })
    trialDays?: number;
}