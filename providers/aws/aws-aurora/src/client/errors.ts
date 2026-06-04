import { DatabaseErrorException } from '@aws-sdk/client-rds-data';

export const isDuplicateUniqueKeyException = (error: unknown) => {
  return error instanceof DatabaseErrorException && error.message.includes('23505');
};

export const isAuthenticationException = (error: unknown) => {
  return error instanceof DatabaseErrorException && error.message.includes('28P01');
};
