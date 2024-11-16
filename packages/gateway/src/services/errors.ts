/**
 * Default HTTP error.
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: string[]
  ) {
    super(message);
  }
}

/**
 * HTTP Bad Request error.
 */
export class HttpBadRequestError extends HttpError {
  constructor(message?: string, details?: string[]) {
    super(400, message || 'Bad request', details);
  }
}

/**
 * HTTP Unauthorized error.
 */
export class HttpUnauthorizedError extends HttpError {
  constructor(message?: string, details?: string[]) {
    super(401, message || 'Unauthorized', details);
  }
}

/**
 * HTTP Forbidden error.
 */
export class HttpForbiddenError extends HttpError {
  constructor(message?: string, details?: string[]) {
    super(403, message || 'Forbidden', details);
  }
}

/**
 * HTTP Not Found error.
 */
export class HttpNotFoundError extends HttpError {
  constructor(message?: string, details?: string[]) {
    super(404, message || 'Not found', details);
  }
}

/**
 * HTTP Internal Server error.
 */
export class HttpInternalServerError extends HttpError {
  constructor(message?: string, details?: string[]) {
    super(500, message || 'Internal server error', details);
  }
}
