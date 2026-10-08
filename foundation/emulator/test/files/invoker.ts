import type { ModuleInvocation } from '@ez4/emulator';
import type { AnyObject } from '@ez4/utils';

export const makeDefaultInvoker = () => {
  return async (invocation: ModuleInvocation) => {
    const request: AnyObject = {};

    try {
      await invocation.begin(request);

      Object.assign(request, invocation.request);

      await invocation.ready(request);

      const response = await invocation.invoke(request);

      await invocation.done(request);

      return response;
    } catch (error) {
      await invocation.error(error, request);
      throw error;
    } finally {
      await invocation.end(request);
    }
  };
};

export const makeTestInvoker = (options: AnyObject) => {
  return async (invocation: ModuleInvocation) => {
    const request: AnyObject = {
      createdByInvoker: true
    };

    try {
      await invocation.begin(request);

      Object.assign(request, {
        ...invocation.request,
        preparedByInvoker: true,
        serviceOption: invocation.context.lazyService?.options?.value,
        invokerOption: options.marker
      });

      await invocation.ready(request);

      const response = await invocation.invoke(request);

      await invocation.done(request);

      return response;
    } catch (error) {
      await invocation.error(error, request);
      throw error;
    } finally {
      await invocation.end(request);
    }
  };
};
