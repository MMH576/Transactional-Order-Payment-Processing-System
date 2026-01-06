import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, EntityType } from '@prisma/client';

@Controller('audit')
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  findRecent(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.auditService.findAll(limit || 100);
  }

  @Get('entity/:type/:id')
  findByEntity(
    @Param('type', new ParseEnumPipe(EntityType)) type: EntityType,
    @Param('id') id: string,
  ) {
    return this.auditService.findByEntity(type, id);
  }

  @Get('actor/:actorId')
  findByActor(@Param('actorId') actorId: string) {
    return this.auditService.findByActor(actorId);
  }
}
