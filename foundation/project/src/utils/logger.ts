import { performance } from 'node:perf_hooks';
import { toRed } from './format';

export const enum LogLevel {
  Error = 0,
  Warning = 1,
  Debug = 2
}

export namespace Logger {
  export type Callback<T> = () => Promise<T> | T;

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
    const matches = string.toString().match(/\n/g);

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

    process.stdout.write(`${message} ...`);

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

      process.stdout.write(`\r${message} (${elapsedTime}ms)\n`);

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
      const logMessage = `${line}`;

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
      const warnLine = `⚠️  ${toRed(line)}`;

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
      const errorLine = `❌ ${toRed(line)}`;

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
      const successLine = `✅ ${line}`;

      if (Context.capture === 0) {
        process.stderr.write(`${successLine}\n`);
      } else {
        Context.buffer.push(successLine);
      }
    }
  };

  export type LogLine = {
    update: (message: string) => void;
  };

  export const logLine = (message: string, name?: string): LogLine => {
    const currentLine = Context.lineCount;

    log(formatLogLine(message, name));

    return {
      update: (message: string) => {
        const targetLine = currentLine - Context.lineCount;
        const promptLine = Context.lineCount - currentLine;

        process.stdout.moveCursor(0, targetLine);
        process.stdout.clearLine(0);

        log(formatLogLine(message, name));
        Context.lineCount--;

        process.stdout.moveCursor(0, promptLine);
      }
    };
  };

  const formatLogLine = (message: string, name: string | undefined) => {
    return name ? `[${name}]: ${message}` : message;
  };
}
