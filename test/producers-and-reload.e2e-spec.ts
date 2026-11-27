import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { MovieOrmEntity } from '../src/infrastructure/database/entities/movie.orm-entity';
import { AllExceptionsFilter } from '../src/presentation/http/filters/all-exceptions.filter';
import { validateEnvironment } from '../src/infrastructure/config/env.validation';

describe('Producers Awards Intervals & Database Reload (e2e)', () => {
  let app: NestFastifyApplication;
  let tempDir: string;
  let csvPath: string;

  const initialCsvContent = [
    'year;title;studios;producers;winner',
    "1980;Can't Stop the Music;Associated Film Distribution;Allan Carr;yes",
    '1984;Bolero;Cannon Films;Bo Derek;yes',
    '1990;Ghosts Can’t Do It;Triumph Releasing;Bo Derek;yes',
    '1991;Hudson Hawk;TriStar Pictures;Joel Silver;yes',
    '1992;The Adventures of Ford Fairlane;20th Century Fox;Joel Silver;yes',
    '2000;Battlefield Earth;Warner Bros.;Jonathan D. Krane, Elie Samaha and John Travolta;yes',
    '2015;Fantastic Four;20th Century Fox;Simon Kinberg, Matthew Vaughn, Hutch Parker, Robert Kulzer and Gregory Goodman;yes',
    '2002;Swept Away;Screen Gems;Matthew Vaughn;yes',
    '1981;Mommie Dearest;Paramount Pictures;Frank Yablans;yes',
  ].join('\n');

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'api-worst-movie-e2e-'));
    csvPath = join(tempDir, 'Movielist.csv');
    await writeFile(csvPath, initialCsvContent, 'utf-8');

    process.env['CSV_FILE_PATH'] = csvPath;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
    delete process.env['CSV_FILE_PATH'];
    await rm(tempDir, { recursive: true, force: true });
  });

  it('GET /producers/awards-top-intervals returns top 2 min and max award intervals with 200 OK', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/producers/awards-top-intervals',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      min: Array<{
        producer: string;
        interval: number;
        previousWin: number;
        followingWin: number;
      }>;
      max: Array<{
        producer: string;
        interval: number;
        previousWin: number;
        followingWin: number;
      }>;
    }>();

    expect(body.min).toEqual([
      {
        producer: 'Joel Silver',
        interval: 1,
        previousWin: 1991,
        followingWin: 1992,
      },
      {
        producer: 'Bo Derek',
        interval: 6,
        previousWin: 1984,
        followingWin: 1990,
      },
    ]);

    expect(body.max).toEqual([
      {
        producer: 'Matthew Vaughn',
        interval: 13,
        previousWin: 2002,
        followingWin: 2015,
      },
      {
        producer: 'Bo Derek',
        interval: 6,
        previousWin: 1984,
        followingWin: 1990,
      },
    ]);
  });

  it('GET /producers/awards-top-intervals/:limit returns top N producers with 200 OK', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/producers/awards-top-intervals/1',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      min: unknown[];
      max: unknown[];
    }>();

    expect(body.min).toEqual([
      {
        producer: 'Joel Silver',
        interval: 1,
        previousWin: 1991,
        followingWin: 1992,
      },
    ]);

    expect(body.max).toEqual([
      {
        producer: 'Matthew Vaughn',
        interval: 13,
        previousWin: 2002,
        followingWin: 2015,
      },
    ]);
  });

  it('GET /producers/awards-top-intervals/:limit returns 400 Bad Request for invalid limits', async () => {
    const zeroResponse = await app.inject({
      method: 'GET',
      url: '/producers/awards-top-intervals/0',
    });
    expect(zeroResponse.statusCode).toBe(400);

    const nonNumericResponse = await app.inject({
      method: 'GET',
      url: '/producers/awards-top-intervals/abc',
    });
    expect(nonNumericResponse.statusCode).toBe(400);
  });

  it('POST /database/reload discards in-memory SQLite state and reloads CSV with 204 No Content', async () => {
    const dataSource = app.get(DataSource);
    const repo = dataSource.getRepository(MovieOrmEntity);
    await repo.clear();

    const emptyCheck = await app.inject({
      method: 'GET',
      url: '/producers/awards-top-intervals',
    });
    expect(emptyCheck.statusCode).toBe(200);
    expect(emptyCheck.json()).toEqual({ min: [], max: [] });

    const reloadResponse = await app.inject({
      method: 'POST',
      url: '/database/reload',
    });
    expect(reloadResponse.statusCode).toBe(204);
    expect(reloadResponse.body).toBe('');

    const restoredCheck = await app.inject({
      method: 'GET',
      url: '/producers/awards-top-intervals/1',
    });
    expect(restoredCheck.statusCode).toBe(200);
    expect(restoredCheck.json()).toEqual({
      min: [
        {
          producer: 'Joel Silver',
          interval: 1,
          previousWin: 1991,
          followingWin: 1992,
        },
      ],
      max: [
        {
          producer: 'Matthew Vaughn',
          interval: 13,
          previousWin: 2002,
          followingWin: 2015,
        },
      ],
    });
  });
});
