import { Inject, Injectable } from '@nestjs/common';
import { InvalidIntervalLimitError } from '../errors/domain.error';
import { Movie } from '../models/movie.model';
import {
  ProducerAwardInterval,
  ProducerAwardIntervalsResult,
} from '../models/producer-award-interval.model';
import {
  MOVIE_REPOSITORY_PORT,
  MovieRepositoryPort,
} from '../ports/movie-repository.port';

@Injectable()
export class ProducerIntervalsService {
  constructor(
    @Inject(MOVIE_REPOSITORY_PORT)
    private readonly movieRepository: MovieRepositoryPort,
  ) {}
  
  private DEFAULT_TOP_LIMIT = 2;

  async getTopAwardIntervals(
    limit: number = this.DEFAULT_TOP_LIMIT,
  ): Promise<ProducerAwardIntervalsResult> {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new InvalidIntervalLimitError(limit);
    }

    const winningMovies = await this.movieRepository.findWinningMovies();
    console.log("Movies: ", winningMovies.length);
    const intervals = this.calculateConsecutiveIntervals(winningMovies);

    const min = [...intervals]
      .sort(
        (a, b) =>
          a.interval - b.interval ||
          a.previousWin - b.previousWin ||
          a.producer.localeCompare(b.producer),
      )
      .slice(0, limit);

    const max = [...intervals]
      .sort(
        (a, b) =>
          b.interval - a.interval ||
          a.previousWin - b.previousWin ||
          a.producer.localeCompare(b.producer),
      )
      .slice(0, limit);

    return { min, max };
  }

  private calculateConsecutiveIntervals(
    winningMovies: readonly Movie[],
  ): ProducerAwardInterval[] {
    const winsByProducer = new Map<string, Set<number>>();

    for (const movie of winningMovies) {
      if (!movie.winner) {
        continue;
      }

      const producers = this.extractProducers(movie.producers);
      for (const producer of producers) {
        const years = winsByProducer.get(producer) ?? new Set<number>();
        years.add(movie.year);
        winsByProducer.set(producer, years);
      }
    }

    const intervals: ProducerAwardInterval[] = [];

    for (const [producer, yearsSet] of winsByProducer.entries()) {
      if (yearsSet.size < 2) {
        continue;
      }

      const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

      for (let i = 1; i < sortedYears.length; i++) {
        const previousWin = sortedYears[i - 1];
        const followingWin = sortedYears[i];

        if (previousWin !== undefined && followingWin !== undefined) {
          intervals.push({
            producer,
            interval: followingWin - previousWin,
            previousWin,
            followingWin,
          });
        }
      }
    }

    return intervals;
  }

  private extractProducers(rawProducers: string): string[] {
    return rawProducers
      .split(/,|\s+and\s+/i)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }
}
