import type { AnyObject } from '@ez4/utils';

export const makeManager = (options: AnyObject = {}) => {
  return {
    createRequest: (request: AnyObject) => {
      return {
        ...request,
        createdByManager: true
      };
    },
    prepareRequest: async (minimal: AnyObject, context: AnyObject) => {
      return {
        ...minimal,
        preparedByManager: true,
        serviceOption: context.math?.options?.value,
        managerOption: options.marker
      };
    },
    finishRequest: (minimal: AnyObject, current?: AnyObject, error?: unknown) => {
      return error ? minimal : current;
    }
  };
};
