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
export const getJsonError = ({ status, message, details }: HttpError) => {
  return {
    status,
    body: {
      type: 'error',
      message,
      details
    }
  };
};

/**
 * Get a exception based on the given HTTP status code.
 *
 * @param status HTTP status code.
 * @param message Exception message.
 * @param details Exception details.
 * @returns Returns the corresponding exception.
 */
export const getHttpException = (status: number, message: string, details?: string[]) => {
  switch (status) {
    case 400:
      return new HttpBadRequestError(message, details);

    case 401:
      return new HttpUnauthorizedError(message, details);

    case 403:
      return new HttpForbiddenError(message, details);

    case 404:
      return new HttpNotFoundError(message, details);

    case 409:
      return new HttpConflictError(message, details);

    case 415:
      return new HttpUnsupportedMediaTypeError(message, details);

    case 422:
      return new HttpUnprocessableEntityError(message, details);

    default:
      return new HttpError(status, message, details);
  }
};
