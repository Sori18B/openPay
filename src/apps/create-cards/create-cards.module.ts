import { Module } from '@nestjs/common';
import { CreateCardsController } from './create-cards.controller';
import { CreateCardsService } from './create-cards.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { OpenPayModule } from 'src/utils/open-pay/open-pay.module';

@Module({
  controllers: [CreateCardsController],
  providers: [CreateCardsService],
  imports: [PrismaModule, OpenPayModule]
})
export class CreateCardsModule {}
