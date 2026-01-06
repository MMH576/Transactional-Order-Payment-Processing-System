import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: { id: string }) {
    return this.ordersService.checkout(user.id, dto);
  }

  @Get('my-orders')
  getMyOrders(@CurrentUser() user: { id: string }) {
    return this.ordersService.findByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }
}
