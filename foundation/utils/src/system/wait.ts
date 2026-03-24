import { scheduler } from 'node:timers/promises';

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
  export type Callback<T> = (count: number, attempts: number) => Promise<Result<T>> | Result<T>;

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

    for (let count = 1; count <= attempts; count++) {
      lastResult = await callback(count, attempts);

      if (lastResult !== RetryAttempt) {
        return lastResult;
      }

      const seconds = Math.max(minDelay, Math.min(maxDelay, (2.25 * count) / 1.5));

      await scheduler.wait(seconds * 1000);
    }

    throw new WaitMaxAttemptsError();
  };
}
