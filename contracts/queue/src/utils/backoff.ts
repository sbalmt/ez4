import { getRandomInteger } from '@ez4/utils';

export const getRetryDelay = (attempt: number, minDelay: number, maxDelay: number) => {
  return Math.min(maxDelay, getRandomInteger(minDelay, minDelay * 2 ** attempt));
};
