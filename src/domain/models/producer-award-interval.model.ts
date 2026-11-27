export interface ProducerAwardInterval {
  readonly producer: string;
  readonly interval: number;
  readonly previousWin: number;
  readonly followingWin: number;
}

export interface ProducerAwardIntervalsResult {
  readonly min: ProducerAwardInterval[];
  readonly max: ProducerAwardInterval[];
}
