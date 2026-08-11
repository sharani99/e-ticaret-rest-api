import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'generated/prisma/enums';
import { basename, join } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateProductDto, userId: number) {
    const { title, description, price, stock, categoryId } = dto;
    const user = await this.userService.currentUser(userId);

    const product = await this.prisma.product.create({
      data: {
        title: title.toLowerCase(),
        description,
        price,
        stock,
        user: {
          connect: {
            id: user.id,
          },
        },
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: true,
      },
    });

    return product;
  }

  async findAll(
    title?: string,
    minPrice?: string,
    maxPrice?: string,
    categoryId?: string,
    page?: string,
    limit?: string,
  ) {
    const min = minPrice !== undefined ? Number(minPrice) : undefined;
    const max = maxPrice !== undefined ? Number(maxPrice) : undefined;
    const category = categoryId !== undefined ? Number(categoryId) : undefined;
    const pageNumber = page !== undefined ? Number(page) : 1;
    const limitNumber = limit !== undefined ? Number(limit) : 10;

    if (
      (min !== undefined && !Number.isFinite(min)) ||
      (max !== undefined && !Number.isFinite(max)) ||
      (min !== undefined && max !== undefined && min > max)
    ) {
      throw new BadRequestException('Geçerli bir fiyat aralığı giriniz');
    }

    if (
      category !== undefined &&
      (!Number.isInteger(category) || category <= 0)
    ) {
      throw new BadRequestException(
        'categoryId pozitif bir tam sayı olmalıdır',
      );
    }

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber <= 0 ||
      !Number.isInteger(limitNumber) ||
      limitNumber <= 0
    ) {
      throw new BadRequestException('page ve limit pozitif tam sayı olmalıdır');
    }

    const products = await this.prisma.product.findMany({
      where: {
        ...(title !== undefined && {
          title: {
            contains: title,
            mode: 'insensitive',
          },
        }),

        ...(min !== undefined || max !== undefined
          ? {
              price: {
                ...(min !== undefined && { gte: min }),
                ...(max !== undefined && { lte: max }),
              },
            }
          : {}),

        ...(category !== undefined && {
          categoryId: category,
        }),
      },

      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,

      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: true,
      },
    });

    return products;
  }

  async uploadProductImage(
    userId: number,
    newProductImage: string,
    productId: number,
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    if (product.imageUrl) {
      await this.removeProductImage(userId, productId);
    }

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        imageUrl: newProductImage,
      },
    });
  }

  async removeProductImage(userId: number, productId: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    if (product.imageUrl) {
      const imagePath = join(
        process.cwd(),
        'images',
        'products',
        basename(product.imageUrl),
      );

      if (existsSync(imagePath)) {
        await unlink(imagePath);
      }
    }

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        imageUrl: null,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: true,
      },
    });
    if (!product) throw new NotFoundException('ürün bulunamadı');
    return product;
  }

  async update(
    id: number,
    userId: number,
    userRole: UserRole,
    dto: UpdateProductDto,
  ) {
    const { title, description, price, stock } = dto;
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    if (product.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Bu ürünü güncelleme yetkiniz yok');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price,
        stock,
      },
    });

    return updatedProduct;
  }

  async remove(id: number, userId: number, userRole: UserRole) {
    const product = await this.findOne(id);

    if (product.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Bu ürünü silme yetkiniz yok');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
