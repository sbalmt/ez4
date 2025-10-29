import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { Cron } from '@ez4/scheduler';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';

export const processSchedulerEvent = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: Cron.Event | null
) => {
  const { services: linkedServices, target } = service;

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

  const clients = linkedServices && context.makeClients(linkedServices);

  const request: Cron.Incoming<Cron.Event | null> = {
    requestId: getRandomUUID(),
    event: null
  };

  try {
    await onBegin(module, clients, request);

    if (service.schema) {
      request.event = event;
    }

    await onReady(module, clients, request);
    await module.handler(request, clients);
    await onDone(module, clients, request);
    //
  } catch (error) {
    await onError(module, clients, request, error);
    //
  } finally {
    await onEnd(module, clients, request);
  }
};
