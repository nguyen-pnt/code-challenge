import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DB_PATH: string;
  DB_SYNC: boolean;
  DB_LOGGING: boolean;
  LOG_LEVEL: string;
  CORS_ORIGIN: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    NODE_ENV: nodeEnv,
    PORT: parseInt(process.env.PORT || '3000', 10),
    DB_PATH: process.env.DB_PATH || `database_${nodeEnv}.sqlite`,
    DB_SYNC: process.env.DB_SYNC === 'true' || nodeEnv === 'development',
    DB_LOGGING: process.env.DB_LOGGING === 'true' || nodeEnv === 'development',
    LOG_LEVEL:
      process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'error' : 'debug'),
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  };
};

export const env = getEnvironmentConfig();

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
