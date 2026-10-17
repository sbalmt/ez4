import { isAnyNumber, isAnyObject } from '@ez4/utils';

export const isHttpError = (error: unknown): error is Error & { status: number } => {
  return isAnyObject(error) && 'status' in error && isAnyNumber(error.status);
};

export const getHttpErrorStatus = (error: unknown) => {
  if (isHttpError(error) && error.status >= 400 && error.status <= 599) {
    return error.status;
  }

  return 500;
};
