import { randomUUID } from 'node:crypto';

/**
 * Get a random UUID.
 *
 * @returns Returns the random UUID.
 */
export const getRandomUUID = () => {
  return randomUUID();
};
