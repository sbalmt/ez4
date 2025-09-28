import { scheduler } from 'node:timers/promises';

export class WaitMaxAttemptsError extends Error {
  constructor() {
    super('Maximum retry attempts reached.');
  }
}

export namespace Wait {
  export type AttemptCallback<T> = (count: number, attempts: number) => Promise<AttemptResult<T>> | AttemptResult<T>;

  export type AttemptResult<T> = typeof RetryAttempt | T;

  export const RetryAttempt = Symbol('@EZ4_RETRY_ATTEMPT');

  /**
   * Wait until the given `callback` function returns a truthy value or the maximum number
   * of `attempts` is reached.
   *
   * @param callback Attempter callback.
   * @param attempts Maximum number of attempts. Default is: 30
   * @returns Returns the `callback` result when not all `attempts` are reached.
   * @throws Throws `WaitMaxAttemptsError` when the maximum attempts are reached.
   */
  export const until = async <T>(callback: AttemptCallback<T>, attempts = 30) => {
    let lastResult: AttemptResult<T> | undefined;

    for (let count = 1; count <= attempts; count++) {
      lastResult = await callback(count, attempts);

      if (lastResult !== RetryAttempt) {
        return lastResult;
      }

      const seconds = Math.min(30, (2 * count) / 1.5);

      await scheduler.wait(seconds * 1000);
    }

    throw new WaitMaxAttemptsError();
  };
}
