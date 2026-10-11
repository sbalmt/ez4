import type { ModuleInvocation, ModuleInvoker } from '@ez4/emulator';
import type { AnyObject } from '@ez4/utils';

import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export type InvokerOptions = {};

export const makeInvoker = (_options: InvokerOptions): ModuleInvoker => {
  return async (invocation: ModuleInvocation) => {
    const traceId = getRandomUUID();

    const request = {
      requestId: getRandomUUID()
    };

    let currentRequest: AnyObject | undefined;

    try {
      await invocation.begin(request);

      currentRequest = {
        ...request,
        ...invocation.request,
        traceId
      };

      Runtime.setScope({
        traceId
      });

      await invocation.ready(currentRequest);

      const response = await invocation.invoke(currentRequest);

      await invocation.done(currentRequest);

      return response;
    } catch (error) {
      await invocation.error(error, currentRequest ?? request);

      throw error;
    } finally {
      await invocation.end(request);
    }
  };
};
