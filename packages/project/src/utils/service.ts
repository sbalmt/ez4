import type { EntryState, EntryStates } from '@ez4/stateful';
import type { ExtraSource, ServiceAliases, ServiceMetadata } from '../types/service.js';
import type { CommonOptions } from '../types/options.js';

import { tryLinkDependency } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { isServiceMetadata } from '../types/service.js';

export const getServiceName = (service: ServiceMetadata | string, options: CommonOptions) => {
  const resourcePrefix = toKebabCase(options.resourcePrefix);
  const projectName = toKebabCase(options.projectName);

  const servicePrefix = `${resourcePrefix}-${projectName}`;

  if (isServiceMetadata(service)) {
    return `${servicePrefix}-${toKebabCase(service.name)}`;
  }

  if (service) {
    return `${servicePrefix}-${toKebabCase(service)}`;
  }

  return servicePrefix;
};

export const getServiceState = (aliases: ServiceAliases, service: ServiceMetadata | string, options: CommonOptions) => {
  const serviceName = getServiceName(service, options);

  const serviceState = aliases[serviceName];

  if (!serviceState) {
    throw new Error(`Service ${serviceName} wasn't found.`);
  }

  return serviceState;
};

export const setServiceState = (aliases: ServiceAliases, state: EntryState, service: ServiceMetadata | string, options: CommonOptions) => {
  const serviceName = getServiceName(service, options);

  if (aliases[serviceName]) {
    throw new Error(`Service ${serviceName} can't be set twice.`);
  }

  aliases[serviceName] = state;
};

export const linkServiceExtras = (state: EntryStates, entryId: string, extras: Record<string, ExtraSource>) => {
  for (const serviceName in extras) {
    const { entryIds: dependencyIds } = extras[serviceName];

    dependencyIds.forEach((dependencyId) => {
      tryLinkDependency(state, entryId, dependencyId);
    });
  }
};
