import type { DynamicLogLine } from '../types/line';

import { TTY } from '../utils/tty';
import { BasicLogger } from './basic';

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

    BasicLogger.log(lastMessage);

    return new (class {
      update(message: string) {
        const difference = TTY.getCurrentLine() - currentLine;

        process.stdout.moveCursor(0, -difference);
        process.stdout.clearLine(0);

        process.stdout.write((lastMessage = message));
        process.stdout.moveCursor(0, difference);
      }

      get message() {
        return lastMessage;
      }
    })();
  };

  TTY.setup();
}
