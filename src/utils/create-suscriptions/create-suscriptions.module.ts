import { Module } from '@nestjs/common';
import { CreateSuscriptionsController } from './create-suscriptions.controller';
import { CreateSubscriptionsService } from './create-suscriptions.service';
import { PrismaModule } from '../../config/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [CreateSuscriptionsController],
  providers: [CreateSubscriptionsService],
})
export class CreateSuscriptionsModule {}
