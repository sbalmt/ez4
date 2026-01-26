import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { Cron } from '@ez4/scheduler';

import { createModule, onBegin, onReady, onDone, onError, onEnd } from '@ez4/local-common';
import { getRandomUUID } from '@ez4/utils';
import { Runtime } from '@ez4/common';

export const processSchedulerEvent = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: Cron.Event | null
) => {
  const { services, target } = service;

  const clients = await context.makeClients(services);
  const traceId = getRandomUUID();

  Runtime.setScope({
    isLocal: true,
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

  const request: Cron.Incoming<Cron.Event | null> = {
    requestId: getRandomUUID(),
    event: null,
    traceId
  };

  try {
    await onBegin(module, clients, request);

    if (service.schema) {
      Object.assign(request, { event });
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
