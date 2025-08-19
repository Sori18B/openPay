import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { AuthModule } from 'src/middlewares/auth/auth.module';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { AuthService } from 'src/middlewares/auth/auth.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [LoginController],
  providers: [LoginService]
})
export class LoginModule {}

