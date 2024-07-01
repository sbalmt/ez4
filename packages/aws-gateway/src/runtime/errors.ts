import { HttpError } from '@ez4/gateway';

/**
 * Get a stringified JSON error for the given HTTP error.
 *
 * @param message Error message.
 * @param details Optional error details.
 * @returns Returns a stringified JSON error containing the given `message` and `details`.
 */
export const formatJsonError = ({ message, details }: HttpError) => {
  return JSON.stringify({
    status: 'error',
    message,
    details
  });
};
