import { performance } from 'node:perf_hooks';
import { toRed } from '../console/format.js';

export namespace Logger {
  export type Callback<T> = () => Promise<T> | T;

  export const execute = async <T>(message: string, callback: Callback<T>) => {
    const startTime = performance.now();

    process.stdout.write(`[EZ4]: ${message} ...`);

    try {
      const response = await callback();

      const elapsedTime = (performance.now() - startTime).toFixed(2);

      process.stdout.write(`\r[EZ4]: ${message} (${elapsedTime}ms)\n`);

      return response;
      //
    } catch (error) {
      process.stdout.write('\n');

      throw error;
    }
  };

  export const clear = () => {
    process.stdout.write('\x1Bc\r');
  };

  export const error = (message: string) => {
    process.stderr.write(toRed(`[EZ4]: ❌ ${message}\n`));
  };

  export const success = (message: string) => {
    process.stderr.write(`[EZ4]: ✅ ${message}\n`);
  };

  export const log = (message: string) => {
    process.stdout.write(`[EZ4]: ${message}\n`);
  };
}
