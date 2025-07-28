import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { isDynamicCronService } from '@ez4/scheduler/library';
import { getServiceName, Logger } from '@ez4/project/library';

import { processTimerEvent } from '../handlers/timer.js';
import { processSchedulerEvent } from '../handlers/scheduler.js';
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
        handler: (event) => {
          return processSchedulerEvent(service, options, context, event);
        }
      });

      if (isDynamicCronService(service)) {
        Logger.log(`⌚ Dynamic scheduler [${serviceName}] is ready`);
      } else {
        processTimerEvent(service, options, context);
      }
    },
    shutdownHandler: () => {
      InMemoryScheduler.deleteScheduler(serviceName);

      Logger.log(`⛔ Stopped scheduler [${serviceName}] events`);
    }
  };
};
