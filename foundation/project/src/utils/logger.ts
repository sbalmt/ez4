import { performance } from 'node:perf_hooks';
import { toRed } from './format';

export const enum LogLevel {
  Error = 0,
  Warning = 1,
  Debug = 2
}

type LoggerContext = {
  logLevel: LogLevel;
  capture: number;
  buffer: string[];
};

export namespace Logger {
  export type Callback<T> = () => Promise<T> | T;

  const Context: LoggerContext = {
    logLevel: LogLevel.Error,
    capture: 0,
    buffer: []
  };

  export const setLevel = (logLevel: LogLevel) => {
    Context.logLevel = logLevel;
  };

  export const execute = async <T>(message: string, callback: Callback<T>) => {
    const startTime = performance.now();

    process.stdout.write(`[EZ4]: ${message} ...`);

    try {
      Context.capture++;

      const response = await callback();

      return response;
      //
    } catch (error) {
      throw error;
      //
    } finally {
      Context.capture--;

      const elapsedTime = (performance.now() - startTime).toFixed(2);

      process.stdout.write(`\r[EZ4]: ${message} (${elapsedTime}ms)\n`);

      if (Context.capture === 0 && Context.buffer.length) {
        process.stdout.write('\n');
        process.stdout.write(Context.buffer.join('\n'));
        process.stdout.write('\n\n');

        Context.buffer = [];
      }
    }
  };

  export const clear = () => {
    if (Context.capture === 0) {
      process.stdout.write('\x1Bc\r');
    }
  };

  export const space = () => {
    if (Context.capture === 0) {
      process.stdout.write('\n');
    } else {
      Context.buffer.push('');
    }
  };

  export const log = (message: string) => {
    for (const line of message.split('\n')) {
      const logMessage = `[EZ4]: ${line}`;

      if (Context.capture === 0) {
        process.stdout.write(`${logMessage}\n`);
      } else {
        Context.buffer.push(logMessage);
      }
    }
  };

  export const debug = (message: string) => {
    if (Context.logLevel <= LogLevel.Debug) {
      log(message);
    }
  };

  export const warn = (message: string) => {
    if (Context.logLevel < LogLevel.Warning) {
      return;
    }

    for (const line of message.split('\n')) {
      const warnLine = toRed(`[EZ4]: ⚠️  ${line}`);

      if (Context.capture === 0) {
        process.stderr.write(`${warnLine}\n`);
      } else {
        Context.buffer.push(warnLine);
      }
    }
  };

  export const error = (message: string) => {
    if (Context.logLevel < LogLevel.Error) {
      return;
    }

    for (const line of message.split('\n')) {
      const errorLine = toRed(`[EZ4]: ❌ ${line}`);

      if (Context.capture === 0) {
        process.stderr.write(`${errorLine}\n`);
      } else {
        Context.buffer.push(errorLine);
      }
    }
  };

  export const success = (message: string) => {
    if (Context.logLevel < LogLevel.Error) {
      return;
    }

    for (const line of message.split('\n')) {
      const successLine = `[EZ4]: ✅ ${line}`;

      if (Context.capture === 0) {
        process.stderr.write(`${successLine}\n`);
      } else {
        Context.buffer.push(successLine);
      }
    }
  };
}
