import { Module } from '@nestjs/common';
import { CreateChargesController } from './create-charges.controller';
import { CreateChargesService } from './create-charges.service';

@Module({
  controllers: [CreateChargesController],
  providers: [CreateChargesService]
})
export class CreateChargesModule {}
