import { Inject, Injectable } from '@nestjs/common';
import {
  DATABASE_RELOAD_PORT,
  DatabaseReloadPort,
} from '../ports/database-reload.port';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DATABASE_RELOAD_PORT)
    private readonly databaseReloadPort: DatabaseReloadPort,
  ) {}

  async reload(): Promise<void> {
    await this.databaseReloadPort.reloadFromSource();
  }
}
