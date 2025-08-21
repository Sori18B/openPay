import { Controller, Post, Body } from '@nestjs/common';
import { OpenPayService } from './open-pay.service';
import { CreatePlanDto } from './dto/plan.dto';

@Controller('open-pay')
export class OpenPayController {
    constructor(private readonly openPayService: OpenPayService) {}

    @Post('plans')
    async createPlan(@Body() createPlanDto: CreatePlanDto) {
        return await this.openPayService.createPlan(createPlanDto);
    }
}
