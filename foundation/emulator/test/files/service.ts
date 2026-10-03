import type { ProviderContext } from '@ez4/emulator';
import type { AnyObject } from '@ez4/utils';

export const makeService = (options: AnyObject, context: ProviderContext) => {
  return {
    options,
    add: (x: number, y: number) => {
      return x + y;
    },
    sub: (x: number, y: number) => {
      return x - y;
    },
    notify: (payload: AnyObject) => {
      context.notify('test-event', payload);
    }
  };
};
