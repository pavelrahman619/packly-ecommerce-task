// Custom error classes for better error handling

export class ValidationError extends Error {
  public statusCode: number;
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 422;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConflictError extends Error {
  public statusCode: number;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends Error {
  public statusCode: number;

  constructor(message: string = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ForbiddenError extends Error {
  public statusCode: number;

  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    Error.captureStackTrace(this, this.constructor);
  }
}
