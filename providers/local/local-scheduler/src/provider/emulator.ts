import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { Cron } from '@ez4/scheduler';

import { createModule, onBegin, onEnd, onError, onReady } from '@ez4/local-common';
import { isDynamicCronService } from '@ez4/scheduler/library';
import { getServiceName, Logger } from '@ez4/project/library';
import { getRandomUUID } from '@ez4/utils';

import { ExpressionType, parseExpression } from '../utils/expression.js';
import { createSchedulerClient } from '../service/client.js';
import { InMemoryScheduler } from '../service/scheduler.js';

export const registerCronEmulator = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const serviceName = service.name;

  InMemoryScheduler.createScheduler(serviceName, {
    handler: async (event: Cron.Event) => {
      await handleSchedulerEvent(service, context, event);
    }
  });

  return {
    type: 'Scheduler',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createSchedulerClient(serviceName);
    },
    bootstrapHandler: () => {
      if (isDynamicCronService(service)) {
        Logger.log(`Dynamic scheduler [${serviceName}] is ready`);
      } else {
        handleCronExpression(service, context);
      }
    }
  };
};

const handleCronExpression = (service: CronService, context: EmulateServiceContext) => {
  const { interval, type, value } = parseExpression(service.expression);

  switch (type) {
    default:
      throw new Error(`Scheduler ${service.name} with invalid expression.`);

    case ExpressionType.Rate:
      Logger.log(`Scheduler [${service.name}] will run every ${value}`);
      setInterval(() => handleSchedulerEvent(service, context, null), interval);
      break;

    case ExpressionType.At:
      Logger.log(`Scheduler [${service.name}] will run at ${value}`);
      setTimeout(() => handleSchedulerEvent(service, context, null), interval);
      break;
  }
};

const handleSchedulerEvent = async (service: CronService, context: EmulateServiceContext, event: Cron.Event | null) => {
  const { services: linkedServices, target } = service;

  const lambdaModule = await createModule({
    handler: target.handler,
    listener: target.listener
  });

  const lambdaContext = linkedServices && context.makeClients(linkedServices);

  const lambdaRequest: Cron.Incoming<Cron.Event | null> = {
    requestId: getRandomUUID(),
    event: null
  };

  try {
    await onBegin(lambdaModule, lambdaContext, lambdaRequest);

    if (event != null) {
      lambdaRequest.event = event;

      await onReady(lambdaModule, lambdaContext, lambdaRequest);
    }

    await lambdaModule.handler(lambdaRequest, lambdaContext);
    //
  } catch (error) {
    await onError(lambdaModule, lambdaContext, lambdaRequest, error);
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
