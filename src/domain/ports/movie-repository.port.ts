import { Movie } from '../models/movie.model';

export const MOVIE_REPOSITORY_PORT = Symbol('MOVIE_REPOSITORY_PORT');

export interface MovieRepositoryPort {
  findWinningMovies(): Promise<Movie[]>;
}
