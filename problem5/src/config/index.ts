import { env, EnvironmentConfig } from './environment';
import { loggingConfig, LoggingConfig } from './logging';
import { serverConfig, ServerConfig } from './server';

export { env, isDevelopment, isProduction, isTest } from './environment';
export { logger, loggingConfig } from './logging';
export { AppDataSource, createDataSource, initializeDatabase, closeDatabase } from './database';
export { serverConfig } from './server';

export interface AppConfig {
  environment: EnvironmentConfig;
  logging: LoggingConfig;
  server: ServerConfig;
}

export const config: AppConfig = {
  environment: env,
  logging: loggingConfig,
  server: serverConfig
};
