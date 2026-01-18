import { Logger } from '@ez4/project/library';

export const assertNoErrors = (errors: Error[]) => {
  if (errors.length) {
    errors.forEach((error) => Logger.error(error.message));
    Logger.space();

    throw new Error('No errors were expected.');
  }
};
