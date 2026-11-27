import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../../../domain/models/movie.model';
import { MovieRepositoryPort } from '../../../domain/ports/movie-repository.port';
import { MovieOrmEntity } from '../entities/movie.orm-entity';

@Injectable()
export class TypeOrmMovieRepository implements MovieRepositoryPort {
  constructor(
    @InjectRepository(MovieOrmEntity)
    private readonly repository: Repository<MovieOrmEntity>,
  ) {}

  async findWinningMovies(): Promise<Movie[]> {
    const entities = await this.repository.find({
      where: { winner: true },
      order: { year: 'ASC', id: 'ASC' },
    });

    return entities.map((entity) => ({
      id: entity.id,
      year: entity.year,
      title: entity.title,
      studios: entity.studios,
      producers: entity.producers,
      winner: entity.winner,
    }));
  }
}
