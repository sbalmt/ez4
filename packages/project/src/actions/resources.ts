import type { EntryState, EntryStates } from '@ez4/stateful';
import type { MetadataReflection } from '../types/metadata.js';
import type { DeployOptions } from '../types/deploy.js';

import { triggerAllAsync } from '@ez4/project/library';

export const prepareDeployResources = async (
  newState: EntryStates,
  oldState: EntryStates,
  metadata: MetadataReflection,
  execRole: EntryState | null,
  options: DeployOptions
) => {
  const operations = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    const promise = triggerAllAsync('deploy:prepareResources', (handler) =>
      handler({ state: newState, role: execRole, service, options })
    );

    operations.push(promise);
  }

  await Promise.all(operations);

  injectPreviousState(newState, oldState);
};

const injectPreviousState = (newState: EntryStates, oldState: EntryStates) => {
  for (const entityId in newState) {
    if (newState[entityId]) {
      newState[entityId].result = oldState[entityId]?.result;
    }
  }
};
