import { Logger } from '@ez4/project/library';
import { ServiceError } from '@ez4/common';
import { isAnyArray } from '@ez4/utils';

export const logErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    error.stack?.split('\n').forEach((line) => Logger.error(`${line}`));
  } else {
    Logger.error(`${error}`);
  }

  if (error instanceof ServiceError && isAnyArray(error.context?.details)) {
    Logger.error(`Details:`);
    error.context.details.forEach((detail: string) => Logger.error(`\t${detail}`));
  }
};
