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

  return {
    type: 'Scheduler',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createSchedulerClient(serviceName);
    },
    bootstrapHandler: () => {
      InMemoryScheduler.createScheduler(serviceName, {
        handler: async (event) => {
          await handleSchedulerEvent(service, options, context, event);
        }
      });

      if (isDynamicCronService(service)) {
        Logger.log(`⌚ Dynamic scheduler [${serviceName}] is ready`);
      } else {
        scheduleNextExpression(service, options, context);
      }
    },
    shutdownHandler: () => {
      InMemoryScheduler.deleteScheduler(serviceName);

      Logger.log(`⛔ Stopped scheduler [${serviceName}] events`);
    }
  };
};

const scheduleNextExpression = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, expression } = service;
  const { interval, type, value } = parseExpression(expression);

  switch (type) {
    case ExpressionType.Cron: {
      Logger.log(`⌚ Scheduler [${serviceName}] will run using cron (${value})`);

      InMemoryScheduler.createTimer(serviceName, 'cron', interval, () => {
        scheduleNextExpression(service, options, context);
      });

      break;
    }

    case ExpressionType.Rate: {
      Logger.log(`⌚ Scheduler [${serviceName}] will run in ${value}`);

      InMemoryScheduler.createTimer(serviceName, 'rate', interval, () => {
        scheduleNextExpression(service, options, context);
      });

      break;
    }

    case ExpressionType.At: {
      Logger.log(`⌚ Scheduler [${serviceName}] will run at ${value}`);

      InMemoryScheduler.createTimer(serviceName, 'at', interval);
      break;
    }
  }
};

const handleSchedulerEvent = async (
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
    await onError(lambdaModule, lambdaContext, lambdaRequest, error);
    //
  } finally {
    await onEnd(lambdaModule, lambdaContext, lambdaRequest);
  }
};
