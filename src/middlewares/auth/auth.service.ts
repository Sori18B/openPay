import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/apps/login/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(data: LoginDto): Promise<any> {
    const user = await this.prismaService.users.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        lastName: true,
        phoneNumber: true,
        email: true,
        password: true,
        roleId: true,
        openPayCustomerId: true,
      },
    });

    if (user && (await bcrypt.compare(data.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async userAdress(userId: number) {
    return this.prismaService.address.findMany({
      where: { userId },
      select: {
        id: true, // Aseguramos que devuelva el id
        // Puedes agregar otros campos si los necesitas en el token
      },
    });
  }

  async login(user: any) {
    // Obtener las direcciones del usuario
    const addresses = await this.userAdress(user.id);

    // Extraer todos los addressIds
    const addressIds = addresses.map((address) => address.id);

    const payload = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: 'admin',
      phoneNumber: user.phoneNumber,
      openPayCustomerId: user.openPayCustomerId,
      addressIds: addressIds, // Array con todos los IDs de direcciones
      permissions: [
        'read',
        'write',
        'delete',
        'manage_users',
        'manage_products',
        'manage_orders',
        'view_analytics',
      ],
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
