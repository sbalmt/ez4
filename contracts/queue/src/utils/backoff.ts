import { getRandomInteger } from '@ez4/utils';

export const getRetryDelay = (attempt: number, minDelay: number, maxDelay: number) => {
  return Math.min(maxDelay, getRandomInteger(minDelay, Math.max(minDelay, 1) * 2 ** attempt));
};
