import type { ModuleInvocation, ModuleInvoker } from '@ez4/emulator';
import type { EventSchema } from '@ez4/topic/utils';
import type { AnyObject } from '@ez4/utils';

import { getJsonEvent } from '@ez4/topic/utils';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export type InvokerOptions = {
  schema: EventSchema;
};

export const makeInvoker = (options: InvokerOptions): ModuleInvoker => {
  const { schema } = options;

  return async (invocation: ModuleInvocation) => {
    const traceId = getRandomUUID();

    const request = {
      requestId: getRandomUUID()
    };

    let currentRequest: AnyObject | undefined;

    try {
      await invocation.begin(request);

      Runtime.setScope({
        traceId
      });

      currentRequest = {
        ...request,
        event: await getJsonEvent(invocation.request, schema),
        traceId
      };

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
