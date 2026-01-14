import { env } from './environment';

export interface LoggingConfig {
  level: string;
  format: 'json' | 'simple';
  enableConsole: boolean;
  enableFile: boolean;
  filename?: string;
}

const getLoggingConfig = (): LoggingConfig => {
  return {
    level: env.LOG_LEVEL,
    format: env.NODE_ENV === 'production' ? 'json' : 'simple',
    enableConsole: true,
    enableFile: env.NODE_ENV === 'production',
    filename: env.NODE_ENV === 'production' ? 'app.log' : undefined
  };
};

export const loggingConfig = getLoggingConfig();

export class Logger {
  private static instance: Logger;
  private config: LoggingConfig;

  private constructor() {
    this.config = loggingConfig;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    
    if (this.config.format === 'json') {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta
      });
    }
    
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  public debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  public info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  public warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  public error(message: string, error?: Error | any, meta?: any): void {
    if (this.shouldLog('error')) {
      const errorMeta = error instanceof Error 
        ? { 
            error: error.message, 
            stack: error.stack,
            ...meta 
          }
        : { error, ...meta };
      
      console.error(this.formatMessage('error', message, errorMeta));
    }
  }
}

export const logger = Logger.getInstance();
