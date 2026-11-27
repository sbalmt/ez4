import type { AnyObject } from '@ez4/utils';

type TestHandler = (request: AnyObject, context: AnyObject) => unknown;

export const firstMiddleware = (next: TestHandler, { mathService }: AnyObject): TestHandler => {
  return async (request, context) => {
    const response = (await next(request, context)) as AnyObject;

    return {
      ...response,
      order: ['first:before', ...((response.order as string[]) ?? []), 'first:after'],
      sum: mathService.add(1, 2)
    };
  };
};

export const secondMiddleware = (next: TestHandler): TestHandler => {
  return async (request, context) => {
    const response = (await next(request, context)) as AnyObject;

    return {
      ...response,
      order: ['second:before', ...((response.order as string[]) ?? []), 'second:after']
    };
  };
};

export const shortCircuitMiddleware = (): TestHandler => {
  return async () => ({
    intercepted: true
  });
};
