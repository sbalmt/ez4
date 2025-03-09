import type { EntryState, EntryStates } from '@ez4/stateful';
import type { ServiceAliases, ServiceMetadata } from '@ez4/project/library';
import type { MetadataReflection } from '../types/metadata.js';
import type { DeployOptions } from '../types/options.js';

import { getServiceState, setServiceState, triggerAllAsync } from '@ez4/project/library';

export const prepareDeployResources = async (
  aliases: ServiceAliases,
  state: EntryStates,
  metadata: MetadataReflection,
  role: EntryState | null,
  options: DeployOptions
) => {
  const operations = [];

  const context = getResourceContext(aliases);

  for (const identity in metadata) {
    const service = metadata[identity];

    const promise = triggerAllAsync('deploy:prepareResources', (handler) =>
      handler({
        state,
        service,
        options,
        role,
        context
      })
    );

    operations.push(promise);
  }

  await Promise.all(operations);
};

export const connectDeployResources = async (
  aliases: ServiceAliases,
  state: EntryStates,
  metadata: MetadataReflection,
  role: EntryState | null,
  options: DeployOptions
) => {
  const operations = [];

  const context = getResourceContext(aliases);

  for (const identity in metadata) {
    const service = metadata[identity];

    const promise = triggerAllAsync('deploy:connectResources', (handler) =>
      handler({
        state,
        service,
        options,
        role,
        context
      })
    );

    operations.push(promise);
  }

  await Promise.all(operations);
};

const getResourceContext = (aliases: ServiceAliases) => {
  return {
    getServiceState: (service: ServiceMetadata | string, options: DeployOptions) => {
      return getServiceState(aliases, service, options);
    },
    setServiceState: (state: EntryState, service: ServiceMetadata | string, options: DeployOptions) => {
      setServiceState(aliases, state, service, options);
    }
  };
};
