import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/customer.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OpenPayService } from 'src/utils/open-pay/open-pay.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateCustomerService {
  constructor(
    private prisma: PrismaService, 
    private openpayService: OpenPayService 
  ) {}

  async createCustomer(data: CreateCustomerDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    try {
      const [openpayCustomer, dbUser] = await Promise.all([
        this.createCustomerOpenPay(data),
        this.createUserDB(data)
      ]);

      return {
        message: "Cliente creado correctamente",
        openpayCustomerId: openpayCustomer.id,
        userId: dbUser.userId
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      
      // Rollback si falló OpenPay pero no la DB
      if (error.message?.includes('OpenPay') && !error.message?.includes('DB')) {
        try {
          await this.rollbackUserCreation(data.email);
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      throw new InternalServerErrorException(
        error.message || 'Error creating customer'
      );
    }
  }

  private async rollbackUserCreation(email: string) {
    await this.prisma.users.delete({
      where: { email }
    });
  }

  async createCustomerOpenPay(data: CreateCustomerDto) {
    const customerPayload = {
      name: data.name,
      last_name: data.lastName,
      email: data.email,
      phone_number: data.phoneNumber,
      requires_account: false,
      address: {
        city: data.address.city,
        state: data.address.state, 
        line1: data.address.line1,
        line2: data.address.line2,
        postal_code: data.address.postalCode,
        country_code: data.address.countryCode,
      },
    };

    try {
      const response = await this.openpayService.createCustomer(customerPayload);
      return response; 
    } catch (error) {
      console.error('OpenPay Error:', error.response?.data || error.message);
      throw new Error(`OpenPay Error: ${error.response?.data?.description || error.message}`);
    }
  }

  async createUserDB(data: CreateCustomerDto) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    try {
      const user = await this.prisma.users.create({
        data: {
          roleId: 1,
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: hashedPassword,
          phoneNumber: data.phoneNumber,
          birthDate: new Date(data.birthDate),
          subscription: data.subscription,
          addresses: {
            create: {
              city: data.address.city,
              state: data.address.state,
              line1: data.address.line1,
              line2: data.address.line2,
              postalCode: data.address.postalCode,
              countryCode: data.address.countryCode
            },
          },
        },
        include: { addresses: true }, 
      });

      return { 
        message: "User created successfully", 
        userId: user.id 
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error(`DB Error: ${error.message}`);
    }
  }

  async getUserById(user_id: number) {
    try {
      const foundUser = await this.prisma.users.findUnique({
        where: { id: user_id },
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
        }
      });

      if (!foundUser) {
        return { message: 'Usuario no encontrado!' };
      }

      return foundUser;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new InternalServerErrorException('Error retrieving user');
    }
  }
}