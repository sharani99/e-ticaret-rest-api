import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateCategoryDto) {
    const name = dto.name?.toLowerCase();
    const category = await this.prisma.category.create({
      data: { name },
    });
    return category;
  }

  async findAll() {
    const category = await this.prisma.category.findMany();
    return category;
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category bulanamadı');
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const name = dto.name?.toLowerCase();

    const category = await this.prisma.category.update({
      where: { id },
      data: { ...(name !== undefined && { name }) },
    });

    return category;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'category silindi',
    };
  }
}
