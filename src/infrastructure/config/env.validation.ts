export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CSV_FILE_PATH: string;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const rawNodeEnv =
    typeof config['NODE_ENV'] === 'string' && config['NODE_ENV'].length > 0
      ? config['NODE_ENV']
      : 'development';

  if (
    rawNodeEnv !== 'development' &&
    rawNodeEnv !== 'production' &&
    rawNodeEnv !== 'test'
  ) {
    throw new Error(
      `Invalid NODE_ENV "${rawNodeEnv}". Expected development, production, or test.`,
    );
  }

  const rawPort = config['PORT'] !== undefined ? Number(config['PORT']) : 3000;
  if (!Number.isInteger(rawPort) || rawPort < 1 || rawPort > 65535) {
    throw new Error(
      `Invalid PORT "${String(config['PORT'])}". Expected an integer between 1 and 65535.`,
    );
  }

  const rawCsvPath =
    typeof config['CSV_FILE_PATH'] === 'string' &&
    config['CSV_FILE_PATH'].trim().length > 0
      ? config['CSV_FILE_PATH'].trim()
      : './Movielist.csv';

  return {
    NODE_ENV: rawNodeEnv,
    PORT: rawPort,
    CSV_FILE_PATH: rawCsvPath,
  };
}
