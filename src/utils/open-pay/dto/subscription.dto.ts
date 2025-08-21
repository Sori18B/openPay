import {IsString, IsBoolean, IsDateString, IsInt, IsOptional} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger';

export class SubscriptionDto{
    @IsString()
    @ApiProperty({ example: 'sub_1234abcd' })
    id: string;

    @IsString()
    @ApiProperty({ example: 'openpay_subscription_id' })
    openpayId: string;

    @IsDateString()
    @ApiProperty({ example: '2025-01-01T00:00:00Z' })
    creationDate: Date;

    @IsBoolean()
    @ApiProperty({ example: false })
    cancelAtPeriodEnd: boolean;

    @IsDateString()
    @ApiProperty({ example: '2025-01-30T00:00:00Z' })
    chargeDate: Date;

    @IsInt()
    @ApiProperty({ example: 2 })
    currentPeriodNumber: number;

    @IsDateString()
    @ApiProperty({ example: '2025-01-30T00:00:00Z'})
    periodEndDate: Date;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-15T00:00:00Z', required: false})
    trialEndDate?: Date;

    @IsString()
    @ApiProperty({ example: 'plan_gold' })
    planId: string;

    @IsString()
    @ApiProperty({ example: 'active' })
    status: string;

    @IsString()
    @ApiProperty({ example: 'cus_987654321' })
    customerId: string;

    @IsOptional()
    @ApiProperty({  })
    card?: any;

    @IsInt()
    @ApiProperty({ example: 1})
    userId: number;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-01T00:00:00Z', required: false })
    createdAt?: Date;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ example: '2025-01-01T00:00:00Z', required: false })
    updatedAt?: Date;
}