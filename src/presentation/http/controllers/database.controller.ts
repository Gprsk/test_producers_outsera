import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DatabaseService } from '../../../domain/services/database.service';

@ApiTags('database')
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('reload')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Discard the current in-memory SQLite database and reload all records from Movielist.csv',
  })
  @ApiNoContentResponse({
    description: 'In-memory database successfully reloaded from CSV',
  })
  @ApiInternalServerErrorResponse({
    description: 'CSV file could not be read or parsed during reload',
  })
  async reloadDatabase(): Promise<void> {
    await this.databaseService.reload();
  }
}
