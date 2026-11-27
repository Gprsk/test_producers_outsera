import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'movies' })
export class MovieOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  year!: number;

  @Column({ type: 'varchar', length: 512 })
  title!: string;

  @Column({ type: 'varchar', length: 512 })
  studios!: string;

  @Column({ type: 'varchar', length: 512 })
  producers!: string;

  @Index('idx_movies_winner')
  @Column({ type: 'boolean', default: false })
  winner!: boolean;
}
