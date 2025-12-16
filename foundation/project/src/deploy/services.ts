import type { EventContext } from '@ez4/project/library';
import type { ServiceMetadata } from '../types/service';
import type { MetadataReflection } from '../types/metadata';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

export const prepareLinkedServices = async (metadata: MetadataReflection, context: EventContext, options: DeployOptions) => {
  const allPrepareEvents = [];

  for (const identity in metadata) {
    const target = metadata[identity];

    if (target.services) {
      const prepareEvent = prepareLinkedServiceContext(target, metadata, options, context);

      allPrepareEvents.push(prepareEvent);
    }
  }

  await Promise.all(allPrepareEvents);
};

const prepareLinkedServiceContext = async (
  target: ServiceMetadata,
  metadata: MetadataReflection,
  options: DeployOptions,
  context: EventContext
) => {
  for (const alias in target.services) {
    const identity = target.services[alias];
    const service = metadata[identity];

    const linkedService = await triggerAllAsync('deploy:prepareLinkedService', (handler) =>
      handler({
        service,
        options,
        context
      })
    );

    if (linkedService) {
      target.context[alias] = linkedService;
    }
  }
};
