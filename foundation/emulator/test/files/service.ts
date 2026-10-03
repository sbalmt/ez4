import type { AnyObject } from '@ez4/utils';

export const makeService = (options: AnyObject) => {
  return {
    options,
    add: (x: number, y: number) => {
      return x + y;
    },
    sub: (x: number, y: number) => {
      return x - y;
    }
  };
};
