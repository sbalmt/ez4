import { getRandomInteger } from '@ez4/utils';

/**
 * Get the next retry delay (in seconds) based on the input parameters.
 *
 * @param currentAttempt Current attempt.
 * @param maxAttempts Maximum number of attempts.
 * @param minDelay Minimum delay for the first attempt.
 * @param maxDelay Maximum delay for the last attempt.
 * @returns Returns the next retry delay value.
 */
export const getRetryDelay = (currentAttempt: number, maxAttempts: number, minDelay: number, maxDelay: number) => {
  const scale = currentAttempt / maxAttempts;

  const lower = minDelay * currentAttempt * scale;
  const upper = (maxDelay - minDelay) * scale;

  const delay = getRandomInteger(lower, upper);

  return Math.min(maxDelay, minDelay + delay);
};
