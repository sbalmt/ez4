import type { ModuleInvocation, ModuleInvoker } from '@ez4/emulator';
import type { EventSchema } from '@ez4/scheduler/utils';
import type { AnyObject } from '@ez4/utils';

import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/runtime';

export type InvokerOptions = {
  schema?: EventSchema;
};

export const makeInvoker = (options: InvokerOptions): ModuleInvoker => {
  const { schema } = options;

  return async (invocation: ModuleInvocation) => {
    const traceId = getRandomUUID();

    Runtime.setScope({
      traceId
    });

    const request: AnyObject = {
      requestId: getRandomUUID(),
      event: null,
      traceId
    };

    try {
      await invocation.begin(request);

      if (schema) {
        Object.assign(request, {
          event: invocation.request.event
        });
      }

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
