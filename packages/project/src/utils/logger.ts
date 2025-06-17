import { performance } from 'node:perf_hooks';

export namespace Logger {
  export type Callback<T> = () => T;

  export const execute = async <T>(message: string, callback: Callback<T>) => {
    const startTime = performance.now();

    process.stdout.write(`[EZ4]: ${message} ...`);

    const result = await callback();
    const endTime = performance.now();

    process.stdout.write(`\r[EZ4]: ${message} (${(endTime - startTime).toFixed(2)}ms)\n`);

    return result;
  };

  export const log = (message: string) => {
    process.stdout.write(`[EZ4]: ${message}\n`);
  };
}
