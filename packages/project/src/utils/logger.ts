import { performance } from 'node:perf_hooks';
import { toRed } from '../console/format.js';

export const enum LogLevel {
  Error = 0,
  Debug = 1
}

type LoggerContext = {
  logLevel: LogLevel;
};

export namespace Logger {
  export type Callback<T> = () => Promise<T> | T;

  const Context: LoggerContext = {
    logLevel: LogLevel.Error
  };

  export const setLevel = (logLevel: LogLevel) => {
    Context.logLevel = logLevel;
  };

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

  export const space = () => {
    process.stdout.write('\n');
  };

  export const log = (message: string) => {
    process.stdout.write(`[EZ4]: ${message}\n`);
  };

  export const error = (message: string) => {
    if (Context.logLevel >= LogLevel.Error) {
      process.stderr.write(toRed(`[EZ4]: ❌ ${message}\n`));
    }
  };

  export const success = (message: string) => {
    if (Context.logLevel >= LogLevel.Debug) {
      debug(`✅ ${message}`);
    }
  };

  export const debug = (message: string) => {
    if (Context.logLevel >= LogLevel.Debug) {
      log(message);
    }
  };
}
