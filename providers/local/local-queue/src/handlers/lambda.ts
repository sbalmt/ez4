import type { QueueImport, QueueService, QueueSubscription } from '@ez4/queue/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { AnyObject } from '@ez4/utils';
import type { Queue } from '@ez4/queue';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getJsonMessage, resolveValidation } from '@ez4/queue/utils';
import { Runtime } from '@ez4/common/runtime';
import { getRandomUUID } from '@ez4/utils';

export const processLambdaMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: QueueSubscription,
  message: AnyObject
) => {
  const { services } = service;

  const clients = await context.makeClients(services);
  const traceId = getRandomUUID();

  Runtime.setScope({
    isLocal: true,
    traceId
  });

  const module = await createModule({
    listener: subscription.listener,
    handler: subscription.handler,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...subscription.variables
    }
  });

  let currentRequest: Queue.Incoming<Queue.Message> | undefined;

  const request = {
    requestId: getRandomUUID(),
    traceId
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, clients, context.type);
  };

  try {
    await onBegin(module, clients, request);

    currentRequest = {
      ...request,
      message: await getJsonMessage(message, service.schema, onCustomValidation)
    };

    await onReady(module, clients, currentRequest);
    await module.handler(currentRequest, clients);
    await onDone(module, clients, currentRequest);
    //
  } catch (error) {
    await onError(module, clients, currentRequest ?? request, error);

    throw error;
    //
  } finally {
    await onEnd(module, clients, request);
  }
};
