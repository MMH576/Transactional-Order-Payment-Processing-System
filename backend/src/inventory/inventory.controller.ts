import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @Roles(Role.ADMIN)
  getAll() {
    return this.inventoryService.getAll();
  }

  @Get(':productId')
  @Roles(Role.ADMIN)
  findOne(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Patch(':productId')
  @Roles(Role.ADMIN)
  update(
    @Param('productId') productId: string,
    @Body() dto: UpdateInventoryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.inventoryService.update(productId, dto, user.id);
  }
}
