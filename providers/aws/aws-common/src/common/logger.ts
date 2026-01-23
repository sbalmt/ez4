import type { DynamicLogLine } from '@ez4/logger';

import { DynamicLogger, LogFormat, LogColor, Logger as ProjectLogger } from '@ez4/logger';

export namespace Logger {
  export type Callback<T> = (logger: OperationLogger) => T | Promise<T>;

  export type OperationLogger = {
    update: (message: string) => void;
  };

  type InternalLogger = {
    instance: DynamicLogLine;
    token: number;
  };

  type InternalBuffer = {
    message: string;
    token: number;
  };

  type InternalState = {
    loggers: InternalLogger[];
    buffers: InternalBuffer[];
    random: number;
    tokens: number;
    limit: number;
  };

  const STATE: InternalState = {
    limit: Math.max(5, Math.trunc(process.stdout.rows / 1.5)),
    loggers: [],
    buffers: [],
    random: 0,
    tokens: 0
  };

  export const maxLines = (limit: number) => {
    STATE.limit = Math.max(2, limit);
  };

  export const logOperation = async <T>(serviceName: string, resource: string, operation: string, callback: Callback<T>) => {
    const token = STATE.tokens++;

    updateLogLine(
      token,
      `▶️  Starting ${LogFormat.toBold(resource)} ${operation} ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}]`)}`
    );

    const logger: OperationLogger = {
      update: (message: string) => {
        updateLogLine(
          token,
          `⏳ Resource ${LogFormat.toBold(resource)} ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}: ${message}]`)}`
        );
      }
    };

    try {
      const result = await callback(logger);

      finishLogLine(
        token,
        `✅ Finished ${LogFormat.toBold(resource)} ${operation} ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}]`)}`
      );

      return result;
      //
    } catch (error) {
      finishLogLine(
        token,
        `❌ Finished ${LogFormat.toColor(LogColor.Red, LogFormat.toBold(resource))} ${operation}` +
          ` with errors ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}]`)}`
      );

      throw error;
    }
  };

  const updateLogStats = () => {
    const { loggers, buffers } = STATE;

    const hidden = buffers.length;
    const total = loggers.length + hidden;

    process.stdout.write(` (processing ${total} changes, ${hidden} hidden)\r`);
  };

  const updateLogLine = (token: number, message: string) => {
    const { loggers, limit } = STATE;

    const tokenLine = loggers.find((current) => current.token === token);

    if (tokenLine) {
      tokenLine.instance.update(message);
      updateLogStats();
      return;
    }

    if (loggers.length >= limit) {
      const randomLine = loggers[STATE.random++ % loggers.length];

      updateLogBuffer(randomLine.token, randomLine.instance.message);

      randomLine.instance.update(message);
      randomLine.token = token;

      updateLogStats();
      return;
    }

    loggers.push({
      instance: DynamicLogger.logLine(message),
      token
    });

    updateLogStats();
  };

  const finishLogLine = (token: number, message: string) => {
    const { loggers } = STATE;

    const tokenLine = loggers.find((current) => current.token === token);
    const firstLine = loggers.shift();

    if (!firstLine) {
      ProjectLogger.log(message);
      restoreLogBuffer();
      return;
    }

    if (tokenLine !== firstLine) {
      if (tokenLine) {
        tokenLine.instance.update(firstLine.instance.message);
        tokenLine.token = firstLine.token;
      } else {
        updateLogBuffer(firstLine.token, firstLine.instance.message);
        removeLogBuffer(token);
      }
    }

    firstLine.instance.update(message);
    restoreLogBuffer();
  };

  const updateLogBuffer = (token: number, message: string) => {
    const { buffers } = STATE;

    const tokenBuffer = buffers.find((current) => current.token === token);

    if (!tokenBuffer) {
      buffers.push({ message, token });
    } else {
      tokenBuffer.message = message;
    }
  };

  const removeLogBuffer = (token: number) => {
    const { buffers } = STATE;

    const tokenIndex = buffers.findIndex((current) => current.token === token);

    if (tokenIndex >= 0) {
      buffers.splice(tokenIndex, 1);
    }
  };

  const restoreLogBuffer = () => {
    const firstBuffer = STATE.buffers.shift();

    if (firstBuffer) {
      updateLogLine(firstBuffer.token, firstBuffer.message);
    }
  };
}
