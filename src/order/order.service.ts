import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}
  
  async create(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('sepet boş');
    }

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        throw new BadRequestException(
          `${item.product.title} için yeterli stok yok`,
        );
      }
    }

    const price = cart.items.map((i) => {
      return i.product.price * i.quantity;
    });

    const totalPrice = price.reduce((total, price) => {
      return total + price;
    }, 0);

    const orderItems = cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.product.price,
    }));

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          totalPrice,
          user: {
            connect: {
              id: userId,
            },
          },
          items: {
            create: orderItems,
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findMyOrders(userId: number) {
    const order = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    return order;
  }

  async findOne(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('sipariş bulunamadı');
    }
    return order;
  }

  async updateStatus(orderId: number, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('sipariş bulunamadı');

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
      },
    });
  }
}
