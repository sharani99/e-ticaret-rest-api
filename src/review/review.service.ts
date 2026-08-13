import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTPaylodType } from 'src/utils/types';
import { UserRole } from 'generated/prisma/enums';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId: number) {
    const { productId, rating, comment } = dto;
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    const review = await this.prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });
    if (review) {
      throw new ConflictException('Bu ürüne zaten yorum yaptınız');
    }

    return this.prisma.review.create({
      data: {
        rating,
        comment,
        user: {
          connect: {
            id: userId,
          },
        },
        product: {
          connect: {
            id: productId,
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
        product: true,
      },
    });
  }

  async findAll(productId: number) {
    const review = await this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return review;
  }

  async findOne(reviewId: number) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    if (!review) throw new NotFoundException('yorum bulunmadı');
    return review;
  }

  async update(reviewId: number, dto: UpdateReviewDto, payload: JWTPaylodType) {
    const review = await this.getReviewBy(reviewId);
    if (review.userId !== payload.id && payload.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Bu yorumu guncelleme hakkina sahip degilsiniz.',
      );
    }
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { ...dto },
    });
  }

  async remove(reviewId: number, payload: JWTPaylodType) {
    const review = await this.getReviewBy(reviewId);
    if (review.userId !== payload.id && payload.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Bu yorumu guncelleme hakkina sahip degilsiniz.',
      );
    }
    await this.prisma.review.delete({
      where: { id: reviewId },
    });
    return { message: 'yorum silindi' };
  }

  private async getReviewBy(id: number) {
    const review = await this.prisma.review.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`${id} numaralı yorum bulunamadı.`);
    }

    return review;
  }
}
