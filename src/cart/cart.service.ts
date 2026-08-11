import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: number, dto: AddToCartDto) {
    const { productId, quantity } = dto;

    // 1. Ürün var mı?
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // 2. İstenen miktar stoktan fazla mı?
    if (quantity > product.stock) {
      throw new BadRequestException('Yeterli stok yok');
    }

    // 3. Kullanıcının sepetini bul, yoksa oluştur
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }

    // 4. Bu ürün zaten sepette mi?
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    // 5. Ürün zaten sepetteyse quantity artır
    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException('Yeterli stok yok');
      }

      return this.prisma.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
        },
      });
    }

    // 6. Sepette yoksa yeni CartItem oluştur
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async getMyCart(userId: number) {
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

    if (!cart) {
      throw new NotFoundException('Sepet bulunamadı');
    }

    return cart;
  }

  async updateQuantity(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const { quantity } = dto;
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Sepet ürünü bulunamadı');
    }

    if (cartItem?.cart.userId !== userId) {
      throw new NotFoundException('bunu değiştiremessiniz');
    }

    if (quantity > cartItem.product.stock) {
      throw new BadRequestException('Yeterli stok yok');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async removeItem(userId: number, itemId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Sepet ürünü bulunamadı');
    }

    if (cartItem.cart.userId !== userId) {
      throw new NotFoundException('Bu ürünü silemezsiniz');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: itemId,
      },
    });

    return {
      message: 'Ürün sepetten silindi',
    };
  }
}
