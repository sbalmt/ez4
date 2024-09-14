import type { MetadataReflection } from '../types/metadata.js';
import type { ServiceMetadata } from '../types/service.js';
import type { DeployOptions } from '../types/deploy.js';

import { triggerAllAsync } from '@ez4/project/library';

export const prepareAllLinkedServices = async (
  metadata: MetadataReflection,
  options: DeployOptions
) => {
  const operations = [];

  for (const identity in metadata) {
    const target = metadata[identity];

    if (target.services) {
      operations.push(prepareTargetLinkedServiceList(target, metadata, options));
    }
  }

  await Promise.all(operations);
};

const prepareTargetLinkedServiceList = async (
  target: ServiceMetadata,
  metadata: MetadataReflection,
  options: DeployOptions
) => {
  const operations = [];

  for (const name in target.services) {
    const identity = target.services[name];
    const service = metadata[identity];

    operations.push(prepareLinkedService(name, target, service, options));
  }

  await Promise.all(operations);
};

const prepareLinkedService = async (
  contextName: string,
  targetService: ServiceMetadata,
  sourceService: ServiceMetadata,
  options: DeployOptions
) => {
  const extraSource = await triggerAllAsync('deploy:prepareLinkedService', (handler) =>
    handler({ service: sourceService, options })
  );

  if (extraSource) {
    targetService.extras = {
      ...targetService.extras,
      [contextName]: extraSource
    };
  }
};
