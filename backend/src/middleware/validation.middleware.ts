import { Request, Response, NextFunction } from 'express';
import { 
  ContentType, 
  IValidationError,
  validateContentTypeData
} from '../types/contentBlock.type';
import { ValidationError, BadRequestError } from '../lib/errors';
import mongoose from 'mongoose';

// Utility function to handle validation results
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This is a placeholder - in a real implementation you'd check validation results
  next();
};

// Custom validator for MongoDB ObjectId
export const isValidObjectId = (value: string) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Custom validator for content type data
export const validateContentTypeDataMiddleware = (contentType: ContentType, data: any) => {
  const errors = validateContentTypeData(contentType, data);
  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return true;
};

// Basic validation middleware for creating content blocks
export const validateCreateContent = [
  (req: Request, res: Response, next: NextFunction) => {
    const { content_type, title, data } = req.body;
    
    // Validate content_type
    if (!content_type || !Object.values(ContentType).includes(content_type)) {
      throw new ValidationError('Validation failed', {
        content_type: ['content_type must be one of: ' + Object.values(ContentType).join(', ')]
      });
    }
    
    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 200) {
      throw new ValidationError('Validation failed', {
        title: ['title must be between 1 and 200 characters']
      });
    }
    
    // Validate data
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Validation failed', {
        data: ['data must be an object']
      });
    }
    
    // Validate content type specific data
    try {
      validateContentTypeDataMiddleware(content_type, data);
    } catch (error: any) {
      throw new ValidationError('Content data validation failed', {
        data: [error.message]
      });
    }
    
    next();
  }
];

// Basic validation middleware for updating content blocks
export const validateUpdateContent = [
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      throw new BadRequestError('Invalid content block ID');
    }
    
    next();
  }
];

// Basic validation middleware for query parameters
export const validateQuery = [
  (req: Request, res: Response, next: NextFunction) => {
    // Basic query validation - in a full implementation you'd validate all query params
    next();
  }
];

// Basic validation middleware for single item reordering
export const validateReorder = [
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { order } = req.body;
    
    if (!isValidObjectId(id)) {
      throw new BadRequestError('Invalid content block ID');
    }
    
    if (typeof order !== 'number' || order < 0) {
      throw new ValidationError('Validation failed', {
        order: ['order must be a non-negative integer']
      });
    }
    
    next();
  }
];

// Basic validation middleware for bulk reordering
export const validateBulkReorder = [
  (req: Request, res: Response, next: NextFunction) => {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Validation failed', {
        items: ['items must be a non-empty array']
      });
    }
    
    for (const item of items) {
      if (!item.id || !isValidObjectId(item.id)) {
        throw new ValidationError('Validation failed', {
          'items.id': ['Each item must have a valid ID']
        });
      }
      
      if (typeof item.order !== 'number' || item.order < 0) {
        throw new ValidationError('Validation failed', {
          'items.order': ['Each item must have a valid order (non-negative integer)']
        });
      }
    }
    
    next();
  }
];

// Basic validation middleware for getting single content block
export const validateGetById = [
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      throw new BadRequestError('Invalid content block ID');
    }
    
    next();
  }
];

// Basic validation middleware for deleting content block
export const validateDelete = [
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      throw new BadRequestError('Invalid content block ID');
    }
    
    next();
  }
];