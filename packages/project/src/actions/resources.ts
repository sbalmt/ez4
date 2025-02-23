import type { EntryState, EntryStates } from '@ez4/stateful';
import type { MetadataReflection } from '../types/metadata.js';
import type { DeployOptions } from '../types/options.js';

import { triggerAllAsync } from '@ez4/project/library';

export const prepareDeployResources = async (
  state: EntryStates,
  metadata: MetadataReflection,
  role: EntryState | null,
  options: DeployOptions
) => {
  const operations = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    const promise = triggerAllAsync('deploy:prepareResources', (handler) =>
      handler({
        state,
        service,
        options,
        role
      })
    );

    operations.push(promise);
  }

  await Promise.all(operations);
};

export const connectDeployResources = async (
  state: EntryStates,
  metadata: MetadataReflection,
  role: EntryState | null,
  options: DeployOptions
) => {
  const operations = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    const promise = triggerAllAsync('deploy:connectResources', (handler) =>
      handler({
        state,
        service,
        options,
        role
      })
    );

    operations.push(promise);
  }

  await Promise.all(operations);
};
