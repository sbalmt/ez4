import { isAnyArray } from '@ez4/utils';
import { ServiceError } from '@ez4/common';
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
  if (error instanceof Error) {
    error.stack?.split('\n').forEach((line) => Logger.error(`${line}`));
  } else {
    Logger.error(`${error}`);
  }

  if (error instanceof ServiceError && isAnyArray(error.context?.details)) {
    Logger.error(`Details:`);

    error.context.details.forEach((detail: string) => {
      Logger.error(`\t${detail}`);
    });
  }
};
