import type { TopicImport, TopicLambdaSubscription, TopicService } from '@ez4/topic/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { createModule } from '@ez4/emulator';

export const processLambdaEvent = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: TopicLambdaSubscription,
  event: AnyObject
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
      module: '@ez4/local-topic/worker',
      options: {
        schema: service.schema
      }
    },
    environment: {
      memory: subscription.memory ?? 128,
      timeout: subscription.timeout ?? 900,
      variables: {
        ...options.variables,
        ...service.variables,
        ...subscription.variables
      }
    }
  });

  await module.invoke(event);
};
