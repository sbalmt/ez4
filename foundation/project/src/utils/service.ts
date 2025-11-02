import type { EntryState, EntryStates } from '@ez4/stateful';
import type { ContextSource, LinkedServices, ServiceAliases, ServiceMetadata } from '../types/service';
import type { CommonOptions } from '../types/options';

import { linkEntryConnection, linkEntryDependency } from '@ez4/stateful';
import { toKebabCase } from '@ez4/utils';

import { isServiceMetadata } from '../types/service';

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

export const linkServiceContext = (state: EntryStates, entryId: string, context: Record<string, ContextSource>) => {
  for (const serviceName in context) {
    const { dependencyIds, connectionIds } = context[serviceName];

    dependencyIds?.forEach((dependencyId) => {
      linkEntryDependency(state, entryId, dependencyId);
    });

    connectionIds?.forEach((connectionId) => {
      linkEntryConnection(state, entryId, connectionId);
    });
  }
};

export const buildServiceContext = (context: Record<string, ContextSource>, services: LinkedServices) => {
  const serviceContext: Record<string, ContextSource> = {};

  for (const serviceName in services) {
    serviceContext[serviceName] = context[serviceName];
  }

  return serviceContext;
};
