import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { Cron } from '@ez4/scheduler';

import { SchedulerDefaults } from '@ez4/scheduler/library';
import { createModule } from '@ez4/emulator';
import { arrayUnique } from '@ez4/utils';

export const processSchedulerEvent = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: Cron.Event | null
) => {
  const { target, schema, services } = service;
  const { handler, middlewares = [], listener, memory, timeout, variables } = target;

  const references = handler.references
    ? arrayUnique(handler.references, ...middlewares.map((current) => current.references), listener?.references)
    : undefined;

  const module = createModule({
    services: context.makeDescriptors(services),
    references: context.makeReferences(services, references),
    workspacePath: options.workspacePath,
    handler,
    middlewares,
    listener,
    invoker: {
      name: 'makeInvoker',
      module: '@ez4/local-scheduler/worker',
      options: {
        schema
      }
    },
    environment: {
      memory: memory ?? SchedulerDefaults.Memory,
      timeout: timeout ?? SchedulerDefaults.Timeout,
      variables: {
        ...options.variables,
        ...service.variables,
        ...variables
      }
    }
  });

  try {
    await module.invoke({ event });
  } catch {
    // Handler errors are already reported by the module.
  }
};
