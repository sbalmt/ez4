import { ServiceError } from '@ez4/runtime';
import { Logger } from '@ez4/logger';

export const getErrorData = (error: unknown) => {
  if (error instanceof Error) {
    const errorType = Object.getPrototypeOf(error);
    const errorClass = errorType?.constructor;
    const errorName = errorClass?.name;

    return {
      name: errorName,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    name: 'Error',
    message: String(error)
  };
};

export const logErrorData = (error: unknown) => {
  const context = error instanceof ServiceError ? error.context : undefined;
  const message = String(error);

  message.split('\n').forEach((line) => Logger.error(`${line}`));

  if (context) {
    const lines = JSON.stringify(context, undefined, 2).split('\n');

    lines.forEach((line) => Logger.error(`${line}`));
  }
};
