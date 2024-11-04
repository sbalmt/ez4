import type { EntryStates } from '@ez4/stateful';
import type { ExtraSource, ServiceMetadata } from '../types/service.js';
import type { DeployOptions } from '../types/deploy.js';

import { tryLinkDependency } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { isServiceMetadata } from '../types/service.js';

export const getServiceName = (service: ServiceMetadata | string, options: DeployOptions) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);

  const servicePrefix = `${resourcePrefix}-${projectName}`;

  if (isServiceMetadata(service)) {
    return `${servicePrefix}-${toKebabCase(service.name)}`;
  }

  return `${servicePrefix}-${toKebabCase(service)}`;
};

export const linkServiceExtras = (
  state: EntryStates,
  entryId: string,
  extras: Record<string, ExtraSource>
) => {
  for (const serviceName in extras) {
    const { entryId: dependencyId } = extras[serviceName];

    if (dependencyId) {
      tryLinkDependency(state, entryId, dependencyId);
    }
  }
};
