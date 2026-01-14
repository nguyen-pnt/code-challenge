import { DataSource } from 'typeorm';
import { env } from './environment';
import { logger } from './logging';
import { entities } from '../entities';

export const createDataSource = (databasePath?: string): DataSource => {
  const dbPath = databasePath || env.DB_PATH;

  return new DataSource({
    type: 'sqlite',
    database: dbPath,
    synchronize: env.DB_SYNC || true,
    logging: env.DB_LOGGING,
    entities: entities,
    migrations: ['src/migrations/*.{ts,js}'],
    subscribers: ['src/subscribers/*.{ts,js}'],
    cache: {
      duration: 30000, // 30 seconds
    },
  });
};

export const AppDataSource = createDataSource();

export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info('Initializing database connection...');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established successfully');
    }
  } catch (error) {
    logger.error('Error during database initialization:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Error during database closure:', error);
    throw error;
  }
};
