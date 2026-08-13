import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import type { JWTPaylodType } from 'src/utils/types';
import { AuthGuard } from 'src/user/guard/auth.guard';

@Controller('api/review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  
  @Post()
  @UseGuards(AuthGuard)
  create(@Body() dto: CreateReviewDto, @CurrentUser() payload: JWTPaylodType) {
    return this.reviewService.create(dto, payload.id);
  }

  @Get('product/:productId')
  findAll(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewService.findAll(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() payload: JWTPaylodType,
  ) {
    return this.reviewService.update(id, dto, payload);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JWTPaylodType,
  ) {
    return this.reviewService.remove(id, payload);
  }
}
