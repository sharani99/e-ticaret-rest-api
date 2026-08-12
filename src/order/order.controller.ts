import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
  Put,
  Body,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import type { JWTPaylodType } from 'src/utils/types';
import { AuthGuard } from 'src/user/guard/auth.guard';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthRolesGuard } from 'src/user/guard/auth-roles.guard';
import { UserRole } from 'generated/prisma/enums';
import { Roles } from 'src/user/decorators/user-role.decorator';

@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() payload: JWTPaylodType) {
    return this.orderService.create(payload.id);
  }

  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.orderService.findAll();
  }

  @Get()
  @UseGuards(AuthGuard)
  findMyOrders(@CurrentUser() payload: JWTPaylodType) {
    return this.orderService.findMyOrders(payload.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @CurrentUser() payload: JWTPaylodType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.findOne(payload.id, id);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }
}
