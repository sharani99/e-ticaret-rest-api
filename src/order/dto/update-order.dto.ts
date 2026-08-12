import { IsEnum } from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}