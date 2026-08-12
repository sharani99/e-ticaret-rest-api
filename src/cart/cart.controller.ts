import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import type { JWTPaylodType } from 'src/utils/types';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('api/cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@CurrentUser() payload: JWTPaylodType, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(payload.id, dto);
  }

  @Get()
  getMyCart(@CurrentUser() payload: JWTPaylodType) {
    return this.cartService.getMyCart(payload.id);
  }

  @Put(':id/decrease')
  decreaseQuantity(
    @CurrentUser() payload: JWTPaylodType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.decreaseQuantity(payload.id, id, dto);
  }

  @Delete(':id')
  removeItem(
    @CurrentUser() payload: JWTPaylodType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeItem(payload.id, id);
  }
}
