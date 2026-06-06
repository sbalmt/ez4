import { scheduler } from 'node:timers/promises';

import { getRandomInteger } from '../number/random';

export class WaitMaxAttemptsError extends Error {
  constructor() {
    super('Maximum retry attempts reached.');
  }
}

export namespace Wait {
  /**
   * Attempt result.
   */
  export type Result<T> = typeof RetryAttempt | T;

  /**
   * Attempt function.
   */
  export type Callback<T> = (attempt: number, attempts: number) => Promise<Result<T>> | Result<T>;

  /**
   * Retry attempt symbol.
   */
  export const RetryAttempt = Symbol('@EZ4_RETRY_ATTEMPT');

  /**
   * Attempt options.
   */
  export type Options = {
    /**
     * Maximum number of attempts.
     * Default is: `30`
     */
    attempts?: number;

    /**
     * Minimum delay (in seconds) for each attempt.
     */
    minDelay?: number;

    /**
     * Maximum delay (in seconds) for each attempt.
     * Default is: `90`
     */
    maxDelay?: number;
  };

  /**
   * Get the next retry delay (in seconds) based on the input parameters.
   *
   * @param attempt Current attempt.
   * @param maxAttempts Maximum number of attempts.
   * @param minDelay Minimum delay for the first attempt.
   * @param maxDelay Maximum delay for the last attempt.
   * @returns Returns the next retry delay value.
   */
  export const delay = (attempt: number, maxAttempts: number, minDelay: number, maxDelay: number) => {
    const priorScale = (attempt - 1) / maxAttempts;
    const newerScale = attempt / maxAttempts;

    const range = maxDelay - minDelay;

    const lower = (range / 2) * priorScale;
    const upper = range * newerScale;

    const delay = getRandomInteger(lower, upper);

    return Math.min(maxDelay, minDelay + delay);
  };

  /**
   * Wait until the given `callback` function returns a truthy value or the maximum number
   * of `attempts` is reached.
   *
   * @param callback Attempt callback.
   * @param options Attempt options.
   * @returns Returns the `callback` result when not all `attempts` are reached.
   * @throws Throws `WaitMaxAttemptsError` when the maximum attempts are reached.
   */
  export const until = async <T>(callback: Callback<T>, options?: Options) => {
    const { attempts = 30, minDelay = 0, maxDelay = 90 } = options ?? {};

    let lastResult: Result<T> | undefined;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      lastResult = await callback(attempt, attempts);

      if (lastResult !== RetryAttempt) {
        return lastResult;
      }

      const seconds = delay(attempt, attempts, minDelay, maxDelay);

      await scheduler.wait(seconds * 1000);
    }

    throw new WaitMaxAttemptsError();
  };
}
