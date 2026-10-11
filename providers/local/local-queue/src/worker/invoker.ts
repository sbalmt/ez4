import type { ModuleInvocation, ModuleInvoker, ProviderContext } from '@ez4/emulator';
import type { MessageSchema } from '@ez4/queue/utils';
import type { ValidationCustomContext } from '@ez4/validator';
import type { AnyObject } from '@ez4/utils';
import type { Queue } from '@ez4/queue';

import { getJsonMessage, resolveValidation } from '@ez4/queue/utils';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

import { ProviderEvent } from '../types/events';

export type InvokerOptions = {
  schema: MessageSchema;
};

export const makeInvoker = (options: InvokerOptions, context: ProviderContext): ModuleInvoker => {
  const { schema } = options;
  const { notify } = context;

  return async (invocation: ModuleInvocation) => {
    const traceId = getRandomUUID();

    const request = {
      requestId: getRandomUUID()
    };

    const onCustomValidation = (value: unknown, { type }: ValidationCustomContext) => {
      return resolveValidation(value, invocation.context, type);
    };

    let currentRequest: AnyObject | undefined;

    try {
      await invocation.begin(request);

      currentRequest = {
        ...request,
        message: await getJsonMessage(invocation.request, schema, onCustomValidation),
        maxAttempts: 1,
        attempt: 1,
        traceId,
        retry: (options?: Queue.RetryOptions) => {
          notify(ProviderEvent.PutMessage, {
            delay: options?.delay,
            message: invocation.request
          });

          return Promise.resolve();
        }
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
