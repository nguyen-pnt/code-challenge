import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError as ClassValidationError } from 'class-validator';
import { ValidationError } from './errorHandler';

type ValidationTarget = 'body' | 'query' | 'params';

export function validateDto<T extends object>(
  dtoClass: new () => T,
  target: ValidationTarget = 'body'
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[target] || {};
      
      // Transform plain object to class instance
      const dto = plainToClass(dtoClass, data, {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
      });
      
      // Validate the DTO
      const errors = await validate(dto, {
        whitelist: false, // Don't strip unknown properties for query params
        forbidNonWhitelisted: false, // Allow extra properties for query params
        skipMissingProperties: true, // Don't validate undefined properties
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = formatValidationErrors(errors);
        return next(new ValidationError(formattedErrors.join(', ')));
      }

      // Replace request data with validated and transformed DTO
      // Note: req.query is read-only, so we store it in a custom property
      if (target === 'query') {
        (req as any).validatedQuery = dto;
      } else {
        req[target] = dto;
      }
      next();
    } catch (error) {
      next(new ValidationError('Invalid request data format'));
    }
  };
}

function formatValidationErrors(errors: ClassValidationError[]): string[] {
  const messages: string[] = [];
  
  for (const error of errors) {
    if (error.constraints) {
      const constraintMessages = Object.values(error.constraints);
      messages.push(...constraintMessages);
    }
    
    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      const childMessages = formatValidationErrors(error.children);
      messages.push(...childMessages);
    }
  }
  
  return messages;
}

// Middleware for validating ID parameters
export function validateIdParam() {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return next(new ValidationError('Invalid resource ID. Must be a positive integer', 'id'));
    }

    // Store parsed ID back to params for type safety
    req.params.id = id.toString();
    next();
  };
}

// Middleware to ensure at least one field is provided for updates
export function validateUpdateNotEmpty() {
  return (req: Request, _res: Response, next: NextFunction) => {
    const body = req.body;
    
    if (!body || typeof body !== 'object') {
      return next(new ValidationError('Request body must be an object'));
    }
    
    const hasValidFields = Object.keys(body).some(key => 
      body[key] !== undefined && body[key] !== null && body[key] !== ''
    );
    
    if (!hasValidFields) {
      return next(new ValidationError('At least one field must be provided for update'));
    }
    
    next();
  };
}
