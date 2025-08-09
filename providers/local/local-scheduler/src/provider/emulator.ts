import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { isDynamicCronService } from '@ez4/scheduler/library';
import { getServiceName, Logger } from '@ez4/project/library';

import { processTimerEvent } from '../handlers/timer.js';
import { processSchedulerEvent } from '../handlers/scheduler.js';
import { InMemoryScheduler } from '../service/scheduler.js';
import { createServiceClient } from '../client/service.js';

export const registerCronEmulator = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const serviceName = service.name;

  return {
    type: 'Scheduler',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return service.schema ? createServiceClient(serviceName, service.schema) : undefined;
    },
    bootstrapHandler: () => {
      InMemoryScheduler.createScheduler(serviceName, {
        handler: (event) => processSchedulerEvent(service, options, context, event)
      });

      if (!options.test) {
        if (!isDynamicCronService(service)) {
          Logger.log(`⌚ Dynamic scheduler [${serviceName}] is ready`);
        } else {
          processTimerEvent(service, options, context);
        }
      }
    },
    shutdownHandler: () => {
      InMemoryScheduler.deleteScheduler(serviceName);

      if (!options.test) {
        Logger.log(`⛔ Stopped scheduler [${serviceName}] events`);
      }
    }
  };
};
