import type { ServiceErrorContext } from '@ez4/common';

import { ServiceError } from '@ez4/common';

/**
 * Default HTTP error.
 */
export class HttpError extends ServiceError {
  constructor(
    public status: number,
    message: string,
    context?: ServiceErrorContext
  ) {
    super(message, context);
  }
}

/**
 * HTTP Bad Request error.
 */
export class HttpBadRequestError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(400, message || 'Bad request', context);
  }
}

/**
 * HTTP Unauthorized error.
 */
export class HttpUnauthorizedError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(401, message || 'Unauthorized', context);
  }
}

/**
 * HTTP Forbidden error.
 */
export class HttpForbiddenError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(403, message || 'Forbidden', context);
  }
}

/**
 * HTTP Not Found error.
 */
export class HttpNotFoundError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(404, message || 'Not found', context);
  }
}

/**
 * HTTP Conflict error.
 */
export class HttpConflictError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(409, message || 'Conflict', context);
  }
}

/**
 * HTTP Unsupported Media Type error.
 */
export class HttpUnsupportedMediaTypeError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(415, message || 'Unsupported media type', context);
  }
}

/**
 * HTTP Unprocessable Entity error.
 */
export class HttpUnprocessableEntityError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(422, message || 'Unprocessable entity', context);
  }
}

/**
 * HTTP Internal Server error.
 */
export class HttpInternalServerError extends HttpError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(500, message || 'Internal server error', context);
  }
}
