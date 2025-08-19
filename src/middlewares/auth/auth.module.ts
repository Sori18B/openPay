import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [PrismaModule, JwtModule.register({
      secret: process.env.JWT_SECRET || 'estaEsLaClaveSecretaQueCambiarPonerlaEnUnEnv',
      signOptions: {expiresIn: '60m'}
    }),],
  exports: [AuthService],

})
export class AuthModule {}
