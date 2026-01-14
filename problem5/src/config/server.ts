import { env } from './environment';

export interface ServerConfig {
  port: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  middleware: {
    bodyLimit: string;
    urlEncoded: boolean;
    requestTimeout: number;
  };
  security: {
    rateLimitWindow: number;
    rateLimitMax: number;
    enableHelmet: boolean;
  };
}

const getServerConfig = (): ServerConfig => {
  return {
    port: env.PORT,
    cors: {
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    middleware: {
      bodyLimit: '10mb',
      urlEncoded: true,
      requestTimeout: 30000 // 30 seconds
    },
    security: {
      rateLimitWindow: 15 * 60 * 1000, // 15 minutes
      rateLimitMax: 100, // limit each IP to 100 requests per windowMs
      enableHelmet: env.NODE_ENV === 'production'
    }
  };
};

export const serverConfig = getServerConfig();
