import type { DynamicLogLine } from '../types/line';

import { TTY } from '../utils/tty';
import { Logger } from './logger';

export namespace DynamicLogger {
  /**
   * Write a log line and produce a handler to update the log line dynamically.
   *
   * @param message Log message.
   * @returns Returns the log line handler.
   */
  export const logLine = (message: string): DynamicLogLine => {
    const currentLine = TTY.getCurrentLine();

    let lastMessage = message;

    Logger.log(lastMessage);

    return new (class {
      update(message: string) {
        const difference = TTY.getCurrentLine() - currentLine;

        process.stdout.moveCursor(0, -difference);
        process.stdout.clearLine(0);

        process.stdout.write(`\r${(lastMessage = message)}`);
        process.stdout.moveCursor(0, difference);
      }

      get message() {
        return lastMessage;
      }
    })();
  };

  export const logExecution = async <T>(message: string, callback: () => Promise<T> | T) => {
    const startTime = performance.now();

    const logger = DynamicLogger.logLine(`${message} ...`);

    try {
      TTY.startBuffer();

      return await callback();
      //
    } catch (error) {
      throw error;
      //
    } finally {
      TTY.stopBuffer();

      const elapsedTime = (performance.now() - startTime).toFixed(2);

      logger.update(`${message} (${elapsedTime}ms)`);

      if (TTY.hasBuffer()) {
        Logger.log(`\n${TTY.getBuffer().join('')}\n`);
      }
    }
  };

  TTY.setup();
}
