import { Request, Response, NextFunction } from "express";
import { 
  ValidationError, 
  NotFoundError, 
  ConflictError, 
  BadRequestError,
  UnauthorizedError,
  ForbiddenError 
} from "../lib/errors";

export const errorHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  console.error("Error occurred:", error);

  let statusCode = 500;
  let message = "Internal server error";
  let errors: Record<string, string[]> | undefined;

  // Handle custom error types
  if (error instanceof ValidationError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (
    error instanceof NotFoundError ||
    error instanceof ConflictError ||
    error instanceof BadRequestError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError
  ) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError' && error.errors) {
    // Mongoose validation errors
    statusCode = 422;
    message = 'Validation failed';
    errors = {};
    Object.keys(error.errors).forEach(field => {
      errors![field] = [error.errors[field].message];
    });
  } else if (error.name === 'CastError') {
    // MongoDB cast errors (invalid ObjectId, etc.)
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate entry found';
  } else {
    // Use existing status and message if available
    statusCode = error.statusCode || error.status || 500;
    message = error.message || "Internal server error";
  }

  const response: any = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};
