import type { ServiceErrorContext } from '@ez4/common';

import {
  HttpBadRequestError,
  HttpUnauthorizedError,
  HttpForbiddenError,
  HttpNotFoundError,
  HttpConflictError,
  HttpUnsupportedMediaTypeError,
  HttpUnprocessableEntityError,
  HttpError,
  WsUnauthorizedError,
  WsForbiddenError,
  WsInternalServerError,
  WsError
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
 * Get an exception based on the given HTTP status code.
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

/**
 * Get an exception based on the given WS close code.
 *
 * @param code WS close code.
 * @param message Exception message.
 * @param context Exception context.
 * @returns Returns the corresponding exception.
 */
export const getWsException = (code: number, message: string, context?: ServiceErrorContext) => {
  switch (code) {
    case 4001:
      return new WsUnauthorizedError(message, context);

    case 4003:
      return new WsForbiddenError(message, context);

    case 4500:
      return new WsInternalServerError(message, context);

    default:
      return new WsError(code, message, context);
  }
};
