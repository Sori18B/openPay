import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/apps/login/dto/login.dto';



@Injectable()
export class AuthService {
    constructor (
    private prismaService: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(data : LoginDto): Promise<any> {
    const user = await this.prismaService.users.findUnique({
      where: {email: data.email},
      select: {
        id: true,
        email: true,
        password: true,
        roleId: true,
        openPayCustomerId: true  
      }
    })

    if (user && await bcrypt.compare(data.password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { id: user.id, email: user.email, role: 
    user.roleId, openPayCustomerId: user.openPayCustomerId  };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }



}
