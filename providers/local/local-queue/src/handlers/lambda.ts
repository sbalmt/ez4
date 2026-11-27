import type { QueueImport, QueueService, QueueSubscription } from '@ez4/queue/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { QueueDefaults } from '@ez4/queue/library';
import { createModule } from '@ez4/emulator';
import { arrayUnique } from '@ez4/utils';

export const processLambdaMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: QueueSubscription,
  message: AnyObject
) => {
  const { handler, middlewares = [], listener, memory, variables } = subscription;
  const { schema, services } = service;

  const references = handler.references
    ? arrayUnique(handler.references, ...middlewares.map(({ references }) => references), listener?.references)
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
      module: '@ez4/local-queue/worker',
      options: {
        schema
      }
    },
    environment: {
      memory: memory ?? QueueDefaults.Memory,
      timeout: service.timeout ?? QueueDefaults.Timeout,
      variables: {
        ...options.variables,
        ...service.variables,
        ...variables
      }
    }
  });

  await module.invoke(message);
};
