import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateCardChargeDto } from './dto/chargeCard.dto';

@Injectable()
export class ChargesService {}
