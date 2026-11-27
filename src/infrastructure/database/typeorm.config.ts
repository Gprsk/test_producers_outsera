import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MovieOrmEntity } from './entities/movie.orm-entity';

export function buildTypeOrmOptions(): TypeOrmModuleOptions {
  return {
    type: 'sqlite',
    database: ':memory:',
    entities: [MovieOrmEntity],
    synchronize: true,
    logging: false,
  };
}
