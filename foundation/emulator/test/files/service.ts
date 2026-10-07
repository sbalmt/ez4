import type { ProviderContext } from '@ez4/emulator';
import type { AnyObject } from '@ez4/utils';

export const makeLazyService = (options: AnyObject, _context: ProviderContext) => {
  return () => ({
    options
  });
};

export const makeMathService = (_options: AnyObject, _context: ProviderContext) => {
  return {
    add: (x: number, y: number) => {
      return x + y;
    },
    sub: (x: number, y: number) => {
      return x - y;
    }
  };
};

export const makeEventService = (_options: AnyObject, context: ProviderContext) => {
  return {
    notify: (payload: AnyObject) => {
      context.notify('test-event-1', payload);
    },
    request: (payload: AnyObject) => {
      return context.request('test-event-2', payload);
    },
    requestError: (payload: AnyObject) => {
      return context.request('test-event-3', payload);
    }
  };
};
