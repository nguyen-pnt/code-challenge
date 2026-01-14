import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../config/logging';
import { ApiResponse } from '../types';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, field?: string) {
    super(
      field ? `${field}: ${message}` : message,
      400,
      'VALIDATION_ERROR'
    );
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

const getErrorStatusCode = (error: AppError): number => {
  if (error.statusCode) {
    return error.statusCode;
  }

  // Handle common Node.js/TypeORM errors
  if (error.name === 'QueryFailedError') {
    return 400;
  }
  
  if (error.name === 'EntityNotFoundError') {
    return 404;
  }

  if (error.name === 'ValidationError') {
    return 400;
  }

  if (error.name === 'CastError') {
    return 400;
  }

  return 500;
};

const getErrorCode = (error: AppError): string => {
  if (error.code) {
    return error.code;
  }

  // Map common error names to codes
  switch (error.name) {
    case 'QueryFailedError':
      return 'DATABASE_ERROR';
    case 'EntityNotFoundError':
      return 'NOT_FOUND';
    case 'ValidationError':
      return 'VALIDATION_ERROR';
    case 'CastError':
      return 'INVALID_DATA';
    case 'MongoError':
      return 'DATABASE_ERROR';
    case 'SyntaxError':
      return 'INVALID_JSON';
    default:
      return 'INTERNAL_ERROR';
  }
};

const formatErrorMessage = (error: AppError, isProduction: boolean): string => {
  if (isProduction && (!error.isOperational || error.statusCode === 500)) {
    return 'Internal server error';
  }

  return error.message;
};

const logError = (error: AppError, req: Request): void => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    code: getErrorCode(error),
    statusCode: getErrorStatusCode(error),
    stack: error.stack,
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    },
    timestamp: new Date().toISOString()
  };

  const statusCode = getErrorStatusCode(error);

  if (statusCode >= 500) {
    logger.error('Server Error', error, errorInfo);
  } else if (statusCode >= 400) {
    logger.warn('Client Error', errorInfo);
  } else {
    logger.info('Request Error', errorInfo);
  }
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logError(error, req);

  const statusCode = getErrorStatusCode(error);
  const errorCode = getErrorCode(error);
  const isProduction = config.environment.NODE_ENV === 'production';
  const message = formatErrorMessage(error, isProduction);

  const response: ApiResponse<null> = {
    success: false,
    error: message,
    ...(error.code && { code: errorCode }),
    ...(!isProduction && error.stack && { stack: error.stack })
  };

  // Ensure headers haven't been sent
  if (!res.headersSent) {
    res.status(statusCode).json(response);
  }
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new NotFoundError('Route');
  error.message = `Route ${req.method} ${req.originalUrl} not found`;
  next(error);
};
