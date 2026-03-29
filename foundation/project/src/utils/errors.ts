import { Logger } from '@ez4/logger';

export const assertNoErrors = (errors: Error[]) => {
  if (errors.length) {
    Logger.space();

    errors.forEach((error) => Logger.error(error.message));

    throw new Error('No errors were expected.');
  }
};
