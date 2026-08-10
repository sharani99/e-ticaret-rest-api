import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { connect } from 'http2';

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

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
