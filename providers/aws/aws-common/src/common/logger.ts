import { DynamicLogger, LogFormat, LogColor } from '@ez4/logger';

export namespace Logger {
  export type Callback<T> = (logger: OperationLogger) => T | Promise<T>;

  export type OperationLogger = {
    update: (message: string) => void;
  };

  export const logOperation = async <T>(serviceName: string, resource: string, operation: string, callback: Callback<T>) => {
    const logger = DynamicLogger.logLine(
      `▶️  Starting ${LogFormat.toBold(resource)} ${operation} ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}]`)}`
    );

    const operationLogger: OperationLogger = {
      update: (message: string) => {
        logger.update(
          `⏳ Resource ${LogFormat.toBold(resource)} ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}: ${message}]`)}`
        );
      }
    };

    try {
      const result = await callback(operationLogger);

      logger.update(
        `✅ Finished ${LogFormat.toBold(resource)} ${operation} ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}]`)}`
      );

      return result;
      //
    } catch (error) {
      logger.update(
        `❌ Finished ${LogFormat.toColor(LogColor.Red, LogFormat.toBold(resource))} ${operation}` +
          ` with errors ${LogFormat.toColor(LogColor.BrightBlack, `[${serviceName}]`)}`
      );

      throw error;
    }
  };
}
