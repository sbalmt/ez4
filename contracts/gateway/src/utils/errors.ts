import type { ServiceErrorContext } from '@ez4/common';

import {
  HttpBadRequestError,
  HttpUnauthorizedError,
  HttpForbiddenError,
  HttpNotFoundError,
  HttpConflictError,
  HttpUnsupportedMediaTypeError,
  HttpUnprocessableEntityError,
  HttpError
} from '@ez4/gateway';

/**
 * Get a JSON error response for the given HTTP error.
 *
 * @returns Returns an error response containing `status`, `message` and `details`.
 */
export const getJsonError = ({ status, message, context }: HttpError) => {
  return {
    status,
    body: {
      type: 'error',
      message,
      context
    }
  };
};

/**
 * Get a exception based on the given HTTP status code.
 *
 * @param status HTTP status code.
 * @param message Exception message.
 * @param context Exception context.
 * @returns Returns the corresponding exception.
 */
export const getHttpException = (status: number, message: string, context?: ServiceErrorContext) => {
  switch (status) {
    case 400:
      return new HttpBadRequestError(message, context);

    case 401:
      return new HttpUnauthorizedError(message, context);

    case 403:
      return new HttpForbiddenError(message, context);

    case 404:
      return new HttpNotFoundError(message, context);

    case 409:
      return new HttpConflictError(message, context);

    case 415:
      return new HttpUnsupportedMediaTypeError(message, context);

    case 422:
      return new HttpUnprocessableEntityError(message, context);

    default:
      return new HttpError(status, message, context);
  }
};
