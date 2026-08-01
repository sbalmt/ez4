import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { Cron } from '@ez4/scheduler';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID, pickObject } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export const processSchedulerEvent = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: Cron.Event | null
) => {
  const { services, target } = service;

  const servicesInUse = target.handler.references ? pickObject(services, target.handler.references) : services;
  const serviceClients = context.makeClients(servicesInUse);

  const traceId = getRandomUUID();

  Runtime.setScope({
    traceId
  });

  const module = await createModule({
    listener: target.listener,
    handler: target.handler,
    version: options.version,
    variables: {
      ...options.variables,
      ...service.variables,
      ...target.variables
    }
  });

  const currentRequest: Cron.Incoming<Cron.Event | null> = {
    requestId: getRandomUUID(),
    event: null,
    traceId
  };

  try {
    await onBegin(module, serviceClients, currentRequest);

    if (service.schema) {
      Object.assign(currentRequest, { event });
    }

    await onReady(module, serviceClients, currentRequest);
    await module.handler(currentRequest, serviceClients);
    await onDone(module, serviceClients, currentRequest);
    //
  } catch (error) {
    await onError(module, serviceClients, currentRequest, error);
    //
  } finally {
    await onEnd(module, serviceClients, currentRequest);
  }
};
