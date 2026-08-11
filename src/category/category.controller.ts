import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { AuthRolesGuard } from 'src/user/guard/auth-roles.guard';
import { Roles } from 'src/user/decorators/user-role.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('api/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard,AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @UseGuards(AuthGuard,AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @UseGuards(AuthGuard,AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
