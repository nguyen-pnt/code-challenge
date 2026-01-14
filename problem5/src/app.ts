import 'reflect-metadata';
import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { logger, config } from './config';
import { initializeDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware';
import createResourceRoutes from './routes/resource.route';
import { ResourceService } from './services/resource.service';
import { ApiResponse } from './types';

export class App {
  public app: Application;
  public resourceService: ResourceService;

  constructor(dataSource?: DataSource) {
    this.app = express();
    this.resourceService = new ResourceService(dataSource);
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: config.server.cors.origin,
      credentials: config.server.cors.credentials,
      methods: config.server.cors.methods,
      allowedHeaders: config.server.cors.allowedHeaders
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: config.server.middleware.bodyLimit }));
    this.app.use(express.urlencoded({ 
      extended: config.server.middleware.urlEncoded,
      limit: config.server.middleware.bodyLimit
    }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('user-agent'),
          ip: req.ip
        });
      });
      
      next();
    });

    // Request timeout middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.setTimeout(config.server.middleware.requestTimeout, () => {
        logger.warn('Request timeout', {
          method: req.method,
          url: req.originalUrl,
          timeout: config.server.middleware.requestTimeout
        });
        
        if (!res.headersSent) {
          const response: ApiResponse<null> = {
            success: false,
            error: 'Request timeout'
          };
          res.status(408).json(response);
        }
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      const response: ApiResponse<{ 
        status: string; 
        timestamp: string; 
        environment: string;
        database: string;
      }> = {
        success: true,
        data: {
          status: 'OK',
          timestamp: new Date().toISOString(),
          environment: config.environment.NODE_ENV,
          database: 'SQLite'
        },
        message: 'Server is running'
      };
      res.json(response);
    });

    // API routes
    this.app.use('/api/v1', createResourceRoutes(this.resourceService));

    // 404 handler
    this.app.use(notFoundHandler);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing application...');
      
      // Initialize database connection
      await initializeDatabase();
      
      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  public getApp(): Application {
    return this.app;
  }
}
