import type { HttpError } from '@ez4/gateway';

/**
 * Get a JSON error response for the given HTTP error.
 *
 * @returns Returns an error response containing `status`, `message` and `details`.
 */
export const getJsonError = ({ status, message, details }: HttpError) => {
  console.warn({ status, message, details });

  return {
    status,
    body: {
      status: 'error',
      message,
      details
    }
  };
};
