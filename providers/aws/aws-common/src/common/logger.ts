import { Color, Logger as ProjectLogger, toBold, toColor, toRed } from '@ez4/project/library';

export namespace Logger {
  export type OperationLogger = ProjectLogger.LogLine;

  export type Callback<T> = (logger: OperationLogger) => T | Promise<T>;

  export const logOperation = async <T>(serviceName: string, resource: string, operation: string, callback: Callback<T>) => {
    const logger = ProjectLogger.logLine(`▶️  Starting ${toBold(resource)} ${operation} ${toColor(Color.BrightBlack, `[${serviceName}]`)}`);

    const operationLogger: OperationLogger = {
      update: (message: string) => {
        logger.update(`⏳ Resource ${toBold(resource)} ${toColor(Color.BrightBlack, `[${serviceName}: ${message}]`)}`);
      }
    };

    try {
      const result = await callback(operationLogger);

      logger.update(`✅ Finished ${toBold(resource)} ${operation} ${toColor(Color.BrightBlack, `[${serviceName}]`)}`);

      return result;
      //
    } catch (error) {
      logger.update(toRed(`❌ Finished ${toBold(resource)} ${operation} [${serviceName}: With errors]`));

      throw error;
    }
  };
}
