import type { BucketEvent, BucketService } from '@ez4/storage/library';
import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { Bucket } from '@ez4/storage';

import { createModule } from '@ez4/emulator';

export const processLambdaEvent = async (
  service: BucketService,
  options: ServeOptions,
  context: EmulateServiceContext,
  event: BucketEvent,
  input: Bucket.ObjectEvent
) => {
  const references = context.makeReferences(service.services, event.handler.references);
  const services = context.makeDescriptors(service.services);

  const module = createModule({
    listener: event.listener,
    handler: event.handler,
    references,
    services,
    invoker: {
      name: 'makeInvoker',
      module: '@ez4/local-storage/worker'
    },
    environment: {
      memory: event.memory ?? 128,
      timeout: event.timeout ?? 900,
      variables: {
        ...options.variables,
        ...service.variables,
        ...event.variables
      }
    }
  });

  await module.invoke(input);
};
