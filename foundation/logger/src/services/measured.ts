import { performance } from 'node:perf_hooks';

import { TTY } from '../utils/tty';
import { DynamicLogger } from './dynamic';
import { BasicLogger } from './basic';

export namespace MeasuredLogger {
  export type Callback<T> = () => Promise<T> | T;

  export const logExecution = async <T>(message: string, callback: Callback<T>) => {
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
        BasicLogger.log(`\n${TTY.getBuffer().join('')}\n`);
      }
    }
  };

  TTY.setup();
}
