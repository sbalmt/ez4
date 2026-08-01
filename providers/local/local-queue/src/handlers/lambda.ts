import type { QueueImport, QueueService, QueueSubscription } from '@ez4/queue/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { ValidationCustomContext } from '@ez4/validator';
import type { AnyObject } from '@ez4/utils';
import type { Queue } from '@ez4/queue';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getJsonMessage, resolveValidation } from '@ez4/queue/utils';
import { getRandomUUID, pickObject } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export const processLambdaMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: QueueSubscription,
  message: AnyObject
) => {
  const { services } = service;

  const servicesInUse = subscription.handler.references ? pickObject(services, subscription.handler.references) : services;
  const serviceClients = context.makeClients(servicesInUse);

  const traceId = getRandomUUID();

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
    requestId: getRandomUUID()
  };

  const onCustomValidation = (value: unknown, context: ValidationCustomContext) => {
    return resolveValidation(value, serviceClients, context.type);
  };

  try {
    await onBegin(module, serviceClients, request);

    currentRequest = {
      ...request,
      message: await getJsonMessage(message, service.schema, onCustomValidation),
      maxAttempts: 1,
      attempt: 1,
      traceId
    };

    Runtime.setScope({
      traceId
    });

    await onReady(module, serviceClients, currentRequest);
    await module.handler(currentRequest, serviceClients);
    await onDone(module, serviceClients, currentRequest);
    //
  } catch (error) {
    await onError(module, serviceClients, currentRequest ?? request, error);

    throw error;
    //
  } finally {
    await onEnd(module, serviceClients, request);
  }
};
