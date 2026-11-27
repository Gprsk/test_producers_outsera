import { InvalidIntervalLimitError } from '../errors/domain.error';
import { Movie } from '../models/movie.model';
import { MovieRepositoryPort } from '../ports/movie-repository.port';
import { ProducerIntervalsService } from './producer-intervals.service';

describe('ProducerIntervalsService', () => {
  const sampleWinners: Movie[] = [
    {
      year: 1980,
      title: 'Movie A',
      studios: 'Studio 1',
      producers: 'Producer Fast, Producer Slow',
      winner: true,
    },
    {
      year: 1981,
      title: 'Movie B',
      studios: 'Studio 1',
      producers: 'Producer Fast',
      winner: true,
    },
    {
      year: 1990,
      title: 'Movie C',
      studios: 'Studio 2',
      producers: 'Producer Medium and Producer Single',
      winner: true,
    },
    {
      year: 1993,
      title: 'Movie D',
      studios: 'Studio 2',
      producers: 'Producer Medium',
      winner: true,
    },
    {
      year: 2000,
      title: 'Movie E',
      studios: 'Studio 3',
      producers: 'Producer Slow',
      winner: true,
    },
  ];

  let repositoryMock: jest.Mocked<MovieRepositoryPort>;
  let service: ProducerIntervalsService;

  beforeEach(() => {
    repositoryMock = {
      findWinningMovies: jest.fn().mockResolvedValue(sampleWinners),
    };
    service = new ProducerIntervalsService(repositoryMock);
  });

  it('returns top 2 smallest and largest intervals by default', async () => {
    const result = await service.getTopAwardIntervals();

    expect(result.min).toEqual([
      { producer: 'Producer Fast', interval: 1, previousWin: 1980, followingWin: 1981 },
      { producer: 'Producer Medium', interval: 3, previousWin: 1990, followingWin: 1993 },
    ]);

    expect(result.max).toEqual([
      { producer: 'Producer Slow', interval: 20, previousWin: 1980, followingWin: 2000 },
      { producer: 'Producer Medium', interval: 3, previousWin: 1990, followingWin: 1993 },
    ]);
  });

  it('respects a custom top N limit', async () => {
    const result = await service.getTopAwardIntervals(1);

    expect(result.min).toHaveLength(1);
    expect(result.min[0]?.producer).toBe('Producer Fast');

    expect(result.max).toHaveLength(1);
    expect(result.max[0]?.producer).toBe('Producer Slow');
  });

  it('throws InvalidIntervalLimitError when limit is less than 1 or non-integer', async () => {
    await expect(service.getTopAwardIntervals(0)).rejects.toThrow(
      InvalidIntervalLimitError,
    );
    await expect(service.getTopAwardIntervals(-3)).rejects.toThrow(
      InvalidIntervalLimitError,
    );
    await expect(service.getTopAwardIntervals(1.5)).rejects.toThrow(
      InvalidIntervalLimitError,
    );
  });
});
