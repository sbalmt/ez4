import { DatabaseResumingException } from '@aws-sdk/client-rds-data';
import { setTimeout } from 'node:timers/promises';

/**
 * Perform the given callback and retry in case of failure due to a resume exception.
 * In every retry `500ms` will be decreased from the initial timeout until it reaches zero.
 * When the initial timeout reaches zero, the original exception is thrown.
 *
 * @param timeout Initial wait time.
 * @param callback Callback performed in every retry.
 * @returns Returns the callback result.
 */
export const withRetryOnResume = async <T>(timeout: number, callback: () => Promise<T>) => {
  for (let milliseconds = timeout; ; milliseconds -= 500) {
    try {
      return await callback();
    } catch (error) {
      if (error instanceof DatabaseResumingException && milliseconds > 0) {
        await setTimeout(milliseconds);
        continue;
      }

      throw error;
    }
  }
};
