import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE_RELOAD_PORT } from '../domain/ports/database-reload.port';
import { MOVIE_REPOSITORY_PORT } from '../domain/ports/movie-repository.port';
import { MovieOrmEntity } from './database/entities/movie.orm-entity';
import { TypeOrmMovieRepository } from './database/repositories/typeorm-movie.repository';
import { MovieCsvLoaderService } from './external/csv/movie-csv-loader.service';

@Module({
  imports: [TypeOrmModule.forFeature([MovieOrmEntity])],
  providers: [
    TypeOrmMovieRepository,
    MovieCsvLoaderService,
    {
      provide: MOVIE_REPOSITORY_PORT,
      useExisting: TypeOrmMovieRepository,
    },
    {
      provide: DATABASE_RELOAD_PORT,
      useExisting: MovieCsvLoaderService,
    },
  ],
  exports: [MOVIE_REPOSITORY_PORT, DATABASE_RELOAD_PORT],
})
export class InfrastructureModule {}
