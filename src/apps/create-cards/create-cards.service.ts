import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CardObjectDto } from './dto/card-dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { OpenPayService } from 'src/utils/open-pay/open-pay.service';
import { CreateCustomerService } from '../create-customer/create-customer.service';

@Injectable()
export class CreateCardsService {
  constructor(
    private prismaService: PrismaService,
    private openpayservice: OpenPayService,
    private customerService: CreateCustomerService,
  ) {}

  // Obtener el customerId de OpenPay a partir del user_id
  async getCustomerId(user_id: number): Promise<string> {
    const user = await this.customerService.getUserById(user_id);

    if (!user) {
      throw new InternalServerErrorException('Usuario no encontrado');
    }

    if (!user.openPayCustomerId) {
      throw new InternalServerErrorException(
        'El usuario no tiene un OpenPay customerId',
      );
    }

    return user.openPayCustomerId;
  }

  // Validar que la dirección pertenezca al usuario
  async validateUserAddress(user_id: number, addressId: number): Promise<void> {
    const address = await this.prismaService.address.findUnique({
      where: { id: addressId },
      select: { userId: true },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    if (address.userId !== user_id) {
      throw new InternalServerErrorException(
        'La dirección no pertenece al usuario',
      );
    }
  }

  // Crear tarjeta en OpenPay
  async createCardOpenPay(user_id: number, data: CardObjectDto) {
    const customerId = await this.getCustomerId(user_id);

    const cardData = {
      card_number: data.card_number,
      holder_name: data.holder_name,
      expiration_year: data.expiration_year,
      expiration_month: data.expiration_month,
      cvv2: data.cvv2,
      device_session_id:
        data.device_session_id || 'kR1MiQhz2otdIuUlQkbEyitIqVMiI16f',
    };

    try {
      const response = await this.openpayservice.createCustomerCard(
        customerId,
        cardData,
      );
      return response;
    } catch (error) {
      console.error('OpenPay Error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        `OpenPay Error: ${error.response?.data?.description || error.message}`,
      );
    }
  }

  // Guardar tarjeta en la base de datos
  async createCardBD(user_id: number, addressId: number, openpayCardData: any) {
    try {
      const user = await this.customerService.getUserById(user_id);

      if (!user || !user.openPayCustomerId) {
        throw new InternalServerErrorException(
          'El usuario no tiene OpenPay customerId',
        );
      }

      // Obtener la dirección para usar sus datos
      const address = await this.prismaService.address.findUnique({
        where: { id: addressId },
      });

      if (!address) {
        throw new NotFoundException('Dirección no encontrada');
      }

      const card = await this.prismaService.card.create({
        data: {
          id: openpayCardData.id,
          type: openpayCardData.type,
          brand: openpayCardData.brand,
          cardNumber: openpayCardData.card_number,
          holderName: openpayCardData.holder_name,
          expirationYear: openpayCardData.expiration_year,
          expirationMonth: openpayCardData.expiration_month,
          allowsCharges: openpayCardData.allows_charges ?? true,
          allowsPayouts: openpayCardData.allows_payouts ?? false,
          creationDate: new Date(openpayCardData.creation_date || Date.now()),
          bankName: openpayCardData.bank_name || null,
          bankCode: openpayCardData.bank_code || null,
          pointsCard: openpayCardData.points || false,

          // Relaciones usando connect
          address: {
            connect: { id: addressId },
          },
          user: {
            connect: { id: user_id },
          },

          // Campos de dirección (usar datos de la dirección relacionada)
          line1: address.street,
          line2: address.neighborhood || '',
          line3: '',
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          countryCode: address.countryCode,
        },
      });

      return card;
    } catch (error) {
      console.error('DB Error:', error);
      throw new InternalServerErrorException(`DB Error: ${error.message}`);
    }
  }

  // Flujo completo: crear tarjeta en OpenPay y guardarla en DB
  async createCard(user_id: number, addressId: number, cardDto: CardObjectDto) {
    try {
      // Validar que la dirección pertenece al usuario
      await this.validateUserAddress(user_id, addressId);

      // 1️⃣ Crear en OpenPay
      const openpayCard = await this.createCardOpenPay(user_id, cardDto);

      // 2️⃣ Guardar en DB
      const cardDB = await this.createCardBD(user_id, addressId, openpayCard);

      return {
        message: 'Tarjeta creada correctamente',
        card: cardDB,
      };
    } catch (error) {
      console.error('Error creando tarjeta:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'Error creando tarjeta',
      );
    }
  }

  // ========== OBTENER TARJETAS DE USUARIO ==========
  async getUserCards(user_id: number) {
    try {
      const user = await this.customerService.getUserById(user_id);

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const cards = await this.prismaService.card.findMany({
        where: { userId: user_id },
        include: {
          address: {
            select: {
              city: true,
              state: true,
              street: true,
              neighborhood: true,
              postalCode: true,
              countryCode: true,
            },
          },
        },
        orderBy: { creationDate: 'desc' },
      });

      return {
        success: true,
        cards: cards.map((card) => ({
          id: card.id,
          type: card.type,
          brand: card.brand,
          cardNumber: card.cardNumber,
          holderName: card.holderName,
          expirationYear: card.expirationYear,
          expirationMonth: card.expirationMonth,
          allowsCharges: card.allowsCharges,
          creationDate: card.creationDate,
          bankName: card.bankName,
          address: card.address,
        })),
      };
    } catch (error) {
      console.error('Error obteniendo tarjetas del usuario:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error obteniendo tarjetas: ${error.message}`,
      );
    }
  }
}
