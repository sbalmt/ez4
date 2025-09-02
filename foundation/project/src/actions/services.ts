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
      const prepareEvent = prepareTargetLinkedServiceList(target, metadata, options, context);

      allPrepareEvents.push(prepareEvent);
    }
  }

  await Promise.all(allPrepareEvents);
};

const prepareTargetLinkedServiceList = async (
  target: ServiceMetadata,
  metadata: MetadataReflection,
  options: DeployOptions,
  context: EventContext
) => {
  const allPrepareEvents = [];

  for (const name in target.services) {
    const identity = target.services[name];
    const service = metadata[identity];

    const prepareEvent = prepareTargetLinkedService(name, target, service, options, context);

    allPrepareEvents.push(prepareEvent);
  }

  await Promise.all(allPrepareEvents);
};

const prepareTargetLinkedService = async (
  contextName: string,
  targetService: ServiceMetadata,
  sourceService: ServiceMetadata,
  options: DeployOptions,
  context: EventContext
) => {
  const extraSource = await triggerAllAsync('deploy:prepareLinkedService', (handler) =>
    handler({
      service: sourceService,
      options,
      context
    })
  );

  if (extraSource) {
    targetService.extras[contextName] = extraSource;
  }
};
