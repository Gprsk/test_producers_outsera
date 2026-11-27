import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { constants as fsConstants } from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { DataSourceReloadError } from '../../../domain/errors/domain.error';
import { DatabaseReloadPort } from '../../../domain/ports/database-reload.port';
import { EnvironmentVariables } from '../../config/env.validation';
import { MovieOrmEntity } from '../../database/entities/movie.orm-entity';

interface ParsedCsvMovieRow {
  readonly year: number;
  readonly title: string;
  readonly studios: string;
  readonly producers: string;
  readonly winner: boolean;
}

@Injectable()
export class MovieCsvLoaderService
  implements OnApplicationBootstrap, DatabaseReloadPort
{
  private readonly logger = new Logger(MovieCsvLoaderService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}
  

  private EXPECTED_HEADER = 'year;title;studios;producers;winner';

  async onApplicationBootstrap(): Promise<void> {
    await this.loadCsvIntoDatabase(true);
  }

  async reloadFromSource(): Promise<void> {
    await this.loadCsvIntoDatabase(false);
  }

  private async loadCsvIntoDatabase(isStartup: boolean): Promise<void> {
    const configuredPath = this.configService.get('CSV_FILE_PATH', {
      infer: true,
    });
    console.log("CSV Path", configuredPath);
    const resolvedPath = resolve(process.cwd(), configuredPath);
    console.log("CSV Path Resolved", resolvedPath);


    let parsedRows: ParsedCsvMovieRow[];

    try {
      await access(resolvedPath, fsConstants.R_OK);
      const rawContent = await readFile(resolvedPath, 'utf-8');
      parsedRows = this.parseCsv(rawContent);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown CSV read error';
      this.logger.error(
        `Obligatory CSV file could not be loaded from "${resolvedPath}": ${message}`,
      );

      if (isStartup) {
        throw new Error(
          `Startup aborted: obligatory CSV file "${resolvedPath}" is missing or invalid (${message})`,
        );
      }

      throw new DataSourceReloadError(message);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.clear(MovieOrmEntity);
      await queryRunner.query(
        `DELETE FROM sqlite_sequence WHERE name = 'movies'`,
      );

      const entities = parsedRows.map((row) =>
        queryRunner.manager.create(MovieOrmEntity, {
          year: row.year,
          title: row.title,
          studios: row.studios,
          producers: row.producers,
          winner: row.winner,
        }),
      );

      await queryRunner.manager.save(MovieOrmEntity, entities, { chunk: 100 });
      await queryRunner.commitTransaction();

      this.logger.log(
        `Loaded ${entities.length} movie records into in-memory SQLite from "${resolvedPath}"`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const message =
        error instanceof Error ? error.message : 'Database transaction failed';
      this.logger.error(`Failed to persist CSV records into SQLite: ${message}`);

      if (isStartup) {
        throw error;
      }

      throw new DataSourceReloadError(message);
    } finally {
      await queryRunner.release();
    }
  }

  private parseCsv(rawContent: string): ParsedCsvMovieRow[] {
    const lines = rawContent
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      throw new Error('CSV file must contain a header row and at least one movie row');
    }

    const header = lines[0]?.trim().toLowerCase();
    if (header !== this.EXPECTED_HEADER) {
      throw new Error(
        `Invalid CSV header "${lines[0] ?? ''}". Expected "${this.EXPECTED_HEADER}"`,
      );
    }

    const rows: ParsedCsvMovieRow[] = [];

    for (let index = 1; index < lines.length; index++) {
      const line = lines[index];
      if (line === undefined) {
        continue;
      }

      const columns = line.split(';');
      if (columns.length < 4 || columns.length > 5) {
        throw new Error(
          `Malformed CSV row at line ${index + 1}: expected 5 semicolon-separated columns`,
        );
      }

      const yearRaw = columns[0]?.trim() ?? '';
      const title = columns[1]?.trim() ?? '';
      const studios = columns[2]?.trim() ?? '';
      const producers = columns[3]?.trim() ?? '';
      const winnerRaw = columns[4]?.trim().toLowerCase() ?? '';

      const year = Number(yearRaw);
      if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        throw new Error(
          `Invalid release year "${yearRaw}" at CSV line ${index + 1}`,
        );
      }

      if (title.length === 0 || producers.length === 0) {
        throw new Error(
          `Missing required title or producers at CSV line ${index + 1}`,
        );
      }

      rows.push({
        year,
        title,
        studios,
        producers,
        winner: winnerRaw === 'yes',
      });
    }

    return rows;
  }
}
