export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidIntervalLimitError extends DomainError {
  constructor(limit: unknown) {
    super(`Limit must be a positive integer greater than or equal to 1. Received: ${String(limit)}`);
  }
}

export class DataSourceReloadError extends DomainError {
  constructor(reason: string) {
    super(`Failed to reload database from CSV source: ${reason}`);
  }
}
