import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditService } from '../audit/audit.service';
import { ActionType, EntityType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateProductDto, actorId: string) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        metadata: dto.metadata || {},
        inventory: {
          create: {
            availableQuantity: dto.initialStock || 0,
            reservedQuantity: 0,
          },
        },
      },
      include: {
        inventory: true,
      },
    });

    // Log the creation
    await this.auditService.log({
      actorId,
      actionType: ActionType.PRODUCT_CREATED,
      entityType: EntityType.PRODUCT,
      entityId: product.id,
      afterState: {
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        metadata: product.metadata,
        inventory: {
          availableQuantity: product.inventory?.availableQuantity,
          reservedQuantity: product.inventory?.reservedQuantity,
        },
      },
    });

    return product;
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        inventory: {
          select: {
            availableQuantity: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto, actorId: string) {
    const beforeState = await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        metadata: dto.metadata,
      },
      include: {
        inventory: true,
      },
    });

    await this.auditService.log({
      actorId,
      actionType: ActionType.PRODUCT_UPDATED,
      entityType: EntityType.PRODUCT,
      entityId: product.id,
      beforeState: {
        id: beforeState.id,
        name: beforeState.name,
        price: beforeState.price.toString(),
        metadata: beforeState.metadata,
      },
      afterState: {
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        metadata: product.metadata,
      },
    });

    return product;
  }
}
