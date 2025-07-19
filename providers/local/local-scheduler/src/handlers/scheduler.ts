import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { Cron } from '@ez4/scheduler';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { Logger } from '@ez4/project/library';
import { getRandomUUID } from '@ez4/utils';

export const processSchedulerEvent = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: Cron.Event | null
) => {
  const { services: linkedServices, target } = service;

  const lambdaModule = await createModule({
    version: options.version,
    listener: target.listener,
    handler: target.handler,
    variables: {
      ...options.variables,
      ...service.variables,
      ...target.variables
    }
  });

  const lambdaContext = linkedServices && context.makeClients(linkedServices);

  const lambdaRequest: Cron.Incoming<Cron.Event | null> = {
    requestId: getRandomUUID(),
    event: null
  };

  try {
    await onBegin(lambdaModule, lambdaContext, lambdaRequest);

    if ((lambdaRequest.event = event) !== null) {
      await onReady(lambdaModule, lambdaContext, lambdaRequest);
    }

    await lambdaModule.handler(lambdaRequest, lambdaContext);
    //
  } catch (error) {
    Logger.error(`${error}`);

    await onError(lambdaModule, lambdaContext, lambdaRequest, error);
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
