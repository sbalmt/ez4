import type { ServiceErrorContext } from '@ez4/common';

import { ServiceError } from '@ez4/common';

/**
 * Default WS error.
 */
export class WsError extends ServiceError {
  constructor(
    public code: number,
    message: string,
    context?: ServiceErrorContext
  ) {
    super(message, context);
  }
}

/**
 * WS Unauthorized error.
 */
export class WsUnauthorizedError extends WsError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(4001, message || 'Unauthorized', context);
  }
}

/**
 * WS Forbidden error.
 */
export class WsForbiddenError extends WsError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(4003, message || 'Forbidden', context);
  }
}

/**
 * WS Internal Server error.
 */
export class WsInternalServerError extends WsError {
  constructor(message?: string, context?: ServiceErrorContext) {
    super(4500, message || 'Internal server error', context);
  }
}
