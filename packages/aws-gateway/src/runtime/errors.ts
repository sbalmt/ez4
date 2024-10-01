import { HttpError } from '@ez4/gateway';

/**
 * Get a JSON error response for the given HTTP error.
 *
 * @returns Returns an error response containing the given `status`, `message` and `details`.
 */
export const getJsonError = ({ status, message, details }: HttpError) => {
  return {
    status,
    body: {
      status: 'error',
      message,
      details
    }
  };
};
