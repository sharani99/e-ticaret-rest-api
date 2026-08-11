import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Put,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import type { JWTPaylodType } from 'src/utils/types';
import { AuthGuard } from '../user/guard/auth.guard';
import { AuthRolesGuard } from 'src/user/guard/auth-roles.guard';
import { Roles } from 'src/user/decorators/user-role.decorator';
import { UserRole } from 'generated/prisma/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { basename } from 'path';
import type { Response } from 'express';

@Controller('api/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  create(@Body() dto: CreateProductDto, @CurrentUser() payload: JWTPaylodType) {
    return this.productService.create(dto, payload.id);
  }

  @Get()
  findAll(
    @Query('title') title?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findAll(
      title,
      minPrice,
      maxPrice,
      categoryId,
      page,
      limit,
    );
  }

  @Post(':id/image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('product-image'))
  uploadProductImage(
    @CurrentUser() payload: JWTPaylodType,
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (!file) {
      throw new BadRequestException('Dosya sağlanmadı!');
    }
    return this.productService.uploadProductImage(
      payload.id,
      file.filename,
      id,
    );
  }

  @Delete(':id/image')
  @UseGuards(AuthGuard)
  removeProductImage(
    @CurrentUser() payload: JWTPaylodType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productService.removeProductImage(payload.id, id);
  }

  @Get('images/:image')
  @UseGuards(AuthGuard)
  showPorfileImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(basename(image), { root: 'images/user' });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() payload: JWTPaylodType,
  ) {
    return this.productService.update(id, payload.id, payload.role, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPaylodType,
  ) {
    return this.productService.remove(id, payload.id, payload.role);
  }
}
