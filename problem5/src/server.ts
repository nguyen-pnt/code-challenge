import { App } from './app';
import { config, logger, closeDatabase } from './config';

const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting server...', {
      environment: config.environment.NODE_ENV,
      port: config.server.port
    });

    const app = new App();
    
    // Initialize the application (database, etc.)
    await app.initialize();

    const server = app.getApp().listen(config.server.port, () => {
      logger.info('Server started successfully', {
        port: config.server.port,
        environment: config.environment.NODE_ENV,
        healthCheck: `http://localhost:${config.server.port}/health`,
        apiBaseUrl: `http://localhost:${config.server.port}/api`
      });
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown', err);
          process.exit(1);
        }

        try {
          // Close database connection
          await closeDatabase();
          
          logger.info('Server shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', reason, { promise });
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Start the server
startServer();
