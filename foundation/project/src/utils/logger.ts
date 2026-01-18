import { performance } from 'node:perf_hooks';
import { Color, toColor } from './format';

export const enum LogLevel {
  Error = 0,
  Warning = 2,
  Information = 3,
  Debug = 4
}

export namespace Logger {
  export type Callback<T> = () => Promise<T> | T;

  export type LogLine = {
    update: (message: string) => void;
  };

  type LoggerContext = {
    logLevel: LogLevel;
    lineCount: number;
    capture: number;
    buffer: string[];
    name?: string;
  };

  const Context: LoggerContext = {
    logLevel: LogLevel.Warning,
    lineCount: 0,
    capture: 0,
    buffer: []
  };

  const OriginalWrite = process.stdout.write.bind(process.stdout);

  process.stdout.write = function (string: Uint8Array | string, ...rest: any[]): boolean {
    const message = string.toString();

    if (Context.capture > 0) {
      Context.buffer.push(message);
      return true;
    }

    const matches = message.match(/\n/g);

    if (matches) {
      Context.lineCount += matches.length;
    }

    return OriginalWrite(string, ...rest);
  };

  export const setLevel = (logLevel: LogLevel) => {
    Context.logLevel = logLevel;
  };

  export const execute = async <T>(message: string, callback: Callback<T>) => {
    const startTime = performance.now();

    const logger = logLine(`${message} ...`);

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

      logger.update(`${message} (${elapsedTime}ms)`);

      if (Context.capture === 0 && Context.buffer.length) {
        log(`\n${Context.buffer.join('')}\n`);
        Context.buffer = [];
      }
    }
  };

  export const log = (message: string) => {
    for (const line of message.split('\n')) {
      process.stdout.write(`${line}\n`);
    }
  };

  export const debug = (message: string) => {
    if (Context.logLevel >= LogLevel.Debug) {
      log(message);
    }
  };

  export const info = (message: string) => {
    if (Context.logLevel >= LogLevel.Information) {
      for (const line of message.split('\n')) {
        process.stderr.write(`ℹ️  ${line}\n`);
      }
    }
  };

  export const warn = (message: string) => {
    if (Context.logLevel >= LogLevel.Warning) {
      for (const line of message.split('\n')) {
        process.stderr.write(`⚠️  ${toColor(Color.Red, line)}\n`);
      }
    }
  };

  export const error = (message: string) => {
    if (Context.logLevel >= LogLevel.Error) {
      for (const line of message.split('\n')) {
        process.stderr.write(`❌ ${toColor(Color.Red, line)}\n`);
      }
    }
  };

  export const success = (message: string) => {
    if (Context.logLevel >= LogLevel.Error) {
      for (const line of message.split('\n')) {
        process.stderr.write(`✅ ${line}\n`);
      }
    }
  };

  export const clear = () => {
    process.stdout.write('\x1Bc\r');
  };

  export const space = () => {
    process.stdout.write('\n');
  };

  export const logLine = (message: string): LogLine => {
    const currentLine = Context.lineCount;

    log(message);

    return {
      update: (message: string) => {
        const difference = Context.lineCount - currentLine;

        process.stdout.moveCursor(0, -difference);
        process.stdout.clearLine(0);

        log(message);

        process.stdout.moveCursor(0, difference);
        Context.lineCount--;
      }
    };
  };
}
