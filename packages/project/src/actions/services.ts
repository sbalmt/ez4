import type { ServiceAliases, ServiceMetadata } from '../types/service.js';
import type { MetadataReflection } from '../types/metadata.js';
import type { DeployOptions } from '../types/options.js';

import { EventContext, triggerAllAsync } from '@ez4/project/library';

import { getEventContext } from './common.js';

export const prepareLinkedServices = async (aliases: ServiceAliases, metadata: MetadataReflection, options: DeployOptions) => {
  const allEvents = [];

  const context = getEventContext(aliases, null);

  for (const identity in metadata) {
    const target = metadata[identity];

    if (target.services) {
      const event = prepareTargetLinkedServiceList(target, metadata, options, context);

      allEvents.push(event);
    }
  }

  await Promise.all(allEvents);
};

const prepareTargetLinkedServiceList = async (
  target: ServiceMetadata,
  metadata: MetadataReflection,
  options: DeployOptions,
  context: EventContext
) => {
  const allEvents = [];

  for (const name in target.services) {
    const identity = target.services[name];
    const service = metadata[identity];

    const event = prepareLinkedService(name, target, service, options, context);

    allEvents.push(event);
  }

  await Promise.all(allEvents);
};

const prepareLinkedService = async (
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
