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
  constructor(message: string, details?: string[]) {
    super(400, message, details);
  }
}

/**
 * HTTP Unauthorized error.
 */
export class HttpUnauthorizedError extends HttpError {
  constructor(message: string, details?: string[]) {
    super(401, message, details);
  }
}

/**
 * HTTP Forbidden error.
 */
export class HttpForbiddenError extends HttpError {
  constructor(message: string, details?: string[]) {
    super(403, message, details);
  }
}

/**
 * HTTP Internal Server error.
 */
export class HttpInternalServerError extends HttpError {
  constructor(message: string, details?: string[]) {
    super(500, message, details);
  }
}
