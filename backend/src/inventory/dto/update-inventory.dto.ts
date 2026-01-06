import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  availableQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  adjustQuantity?: number; // Positive to add, negative to remove
}
