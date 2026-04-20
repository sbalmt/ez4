import type { BucketEvent, BucketService } from '@ez4/storage/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { Bucket } from '@ez4/storage';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export const processLambdaEvent = async (
  service: BucketService,
  options: ServeOptions,
  context: EmulateServiceContext,
  events: BucketEvent,
  event: Bucket.Event
) => {
  const { services } = service;

  const clients = await context.makeClients(services);
  const traceId = getRandomUUID();

  const module = await createModule({
    listener: events.listener,
    handler: events.handler,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...events.variables
    }
  });

  let currentRequest: Bucket.Incoming | undefined;

  const request = {
    requestId: getRandomUUID()
  };

  try {
    await onBegin(module, clients, request);

    currentRequest = {
      ...request,
      ...event,
      traceId
    };

    Runtime.setScope({
      traceId
    });

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
