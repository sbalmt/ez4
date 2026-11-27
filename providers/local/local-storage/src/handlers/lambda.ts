import type { BucketEvent, BucketService } from '@ez4/storage/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { Bucket } from '@ez4/storage';

import { StorageDefaults } from '@ez4/storage/library';
import { createModule } from '@ez4/emulator';
import { arrayUnique } from '@ez4/utils';

export const processLambdaEvent = async (
  service: BucketService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: BucketEvent,
  input: Bucket.ObjectEvent
) => {
  const { handler, middlewares = [], listener, memory, timeout, variables } = event;
  const { services } = service;

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
      module: '@ez4/local-storage/worker'
    },
    environment: {
      memory: memory ?? StorageDefaults.Memory,
      timeout: timeout ?? StorageDefaults.Timeout,
      variables: {
        ...options.variables,
        ...service.variables,
        ...variables
      }
    }
  });

  await module.invoke(input);
};
