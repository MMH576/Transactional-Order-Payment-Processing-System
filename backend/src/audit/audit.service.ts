import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionType, EntityType, Prisma } from '@prisma/client';

export interface AuditLogData {
  actorId?: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        actionType: data.actionType,
        entityType: data.entityType,
        entityId: data.entityId,
        beforeState: data.beforeState ?? Prisma.JsonNull,
        afterState: data.afterState ?? Prisma.JsonNull,
      },
    });
  }

  async findByEntity(entityType: EntityType, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findByActor(actorId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        actorId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findAll(limit = 100) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
