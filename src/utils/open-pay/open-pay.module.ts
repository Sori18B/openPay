import { Module } from '@nestjs/common';
import { OpenPayController } from './open-pay.controller';
import { OpenPayService } from './open-pay.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [OpenPayController],
  providers: [OpenPayService],
  exports: [OpenPayService],
  imports: [ConfigModule]
})
export class OpenPayModule {}
