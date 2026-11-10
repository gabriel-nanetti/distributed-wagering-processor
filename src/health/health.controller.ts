import { Controller, Get } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Controller('health')
export class HealthController {
  constructor(private readonly em: EntityManager) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    await this.em.getConnection().execute('SELECT 1');
    return { status: 'ok', postgres: 'up' };
  }
}