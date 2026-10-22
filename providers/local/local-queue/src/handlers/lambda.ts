import type { QueueImport, QueueService, QueueSubscription } from '@ez4/queue/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { QueueDefaults } from '@ez4/queue/library';
import { createModule } from '@ez4/emulator';

export const processLambdaMessage = async (
  service: QueueService | QueueImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: QueueSubscription,
  message: AnyObject
) => {
  const references = context.makeReferences(service.services, subscription.handler.references);
  const services = context.makeDescriptors(service.services);

  const module = createModule({
    listener: subscription.listener,
    handler: subscription.handler,
    references,
    services,
    invoker: {
      name: 'makeInvoker',
      module: '@ez4/local-queue/worker',
      options: {
        schema: service.schema
      }
    },
    environment: {
      memory: subscription.memory ?? QueueDefaults.Memory,
      timeout: service.timeout ?? QueueDefaults.Timeout,
      variables: {
        ...options.variables,
        ...service.variables,
        ...subscription.variables
      }
    }
  });

  await module.invoke(message);
};
