export interface Movie {
  readonly id?: number;
  readonly year: number;
  readonly title: string;
  readonly studios: string;
  readonly producers: string;
  readonly winner: boolean;
}
