import type { TopicImport, TopicLambdaSubscription, TopicService } from '@ez4/topic/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { TopicDefaults } from '@ez4/topic/library';
import { createModule } from '@ez4/emulator';
import { arrayUnique } from '@ez4/utils';

export const processLambdaEvent = async (
  service: TopicService | TopicImport,
  options: ServeOptions,
  context: EmulateServiceContext,
  subscription: TopicLambdaSubscription,
  event: AnyObject
) => {
  const { handler, listener, middlewares = [], memory, timeout, variables } = subscription;
  const { services, schema } = service;

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
      module: '@ez4/local-topic/worker',
      options: {
        schema
      }
    },
    environment: {
      memory: memory ?? TopicDefaults.Memory,
      timeout: timeout ?? TopicDefaults.Timeout,
      variables: {
        ...options.variables,
        ...service.variables,
        ...variables
      }
    }
  });

  await module.invoke(event);
};
