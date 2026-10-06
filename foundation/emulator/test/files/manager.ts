import type { AnyObject } from '@ez4/utils';

export const makeDefaultManager = () => ({
  beginRequest: () => ({}),
  prepareRequest: (_minimal: unknown, request: unknown) => request,
  finishRequest: (request: unknown) => request
});

export const makeTestManager = (options: AnyObject = {}) => {
  return {
    beginRequest: (original: AnyObject) => {
      return {
        ...original,
        createdByManager: true
      };
    },
    prepareRequest: async (minimal: AnyObject, _original: AnyObject, context: AnyObject) => {
      return {
        ...minimal,
        preparedByManager: true,
        serviceOption: context.lazyService?.options?.value,
        managerOption: options.marker
      };
    },
    finishRequest: (minimal: AnyObject, prepared?: AnyObject, error?: unknown) => {
      return error ? minimal : prepared;
    }
  };
};
