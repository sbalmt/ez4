import { Logger } from '@ez4/project/library';
import { ServiceError } from '@ez4/common';

export const logErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    error.stack?.split('\n').forEach((line) => Logger.error(`${line}`));
  } else {
    Logger.error(`${error}`);
  }

  if (error instanceof ServiceError && error.details) {
    Logger.error(`Details:`);
    error.details?.forEach((detail) => Logger.error(`\t${detail}`));
  }
};
