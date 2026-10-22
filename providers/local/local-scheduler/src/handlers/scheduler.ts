import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { Cron } from '@ez4/scheduler';

import { SchedulerDefaults } from '@ez4/scheduler/library';
import { createModule } from '@ez4/emulator';

export const processSchedulerEvent = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: Cron.Event | null
) => {
  const { target } = service;

  const references = context.makeReferences(service.services, target.handler.references);
  const services = context.makeDescriptors(service.services);

  const module = createModule({
    listener: target.listener,
    handler: target.handler,
    references,
    services,
    invoker: {
      name: 'makeInvoker',
      module: '@ez4/local-scheduler/worker',
      options: {
        schema: service.schema
      }
    },
    environment: {
      memory: target.memory ?? SchedulerDefaults.Memory,
      timeout: target.timeout ?? SchedulerDefaults.Timeout,
      variables: {
        ...options.variables,
        ...service.variables,
        ...target.variables
      }
    }
  });

  try {
    await module.invoke({ event });
  } catch {
    // Handler errors are already reported by the module.
  }
};
