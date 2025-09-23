import { scheduler } from 'node:timers/promises';

export type Attempter<T> = (count: number, attempts: number) => Promise<T | undefined> | T | undefined;

/**
 * Wait until the given `attempter` returns a truthy value or the maximum number
 * of `attempts` is reached.
 *
 * @param attempter Attempter callback.
 * @param attempts Maximum number of attempts. Default is: 30
 * @returns Returns the `attempter` result or `null` when all `attempts` are reached.
 */
export const waitFor = async <T>(attempter: Attempter<T>, attempts: number = 30) => {
  let result: T | undefined;

  for (let count = 0; count <= attempts; count++) {
    if ((result = await attempter(count, attempts)) !== undefined) {
      return result;
    }

    const seconds = Math.min(30, (2 * (count + 1)) / 1.5);

    await scheduler.wait(seconds * 1000);
  }

  return null;
};
