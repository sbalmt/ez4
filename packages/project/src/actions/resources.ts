import type { EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { MetadataReflection } from '../types/metadata.js';
import type { DeployOptions } from '../types/options.js';

import { triggerAllAsync } from '@ez4/project/library';

export const prepareDeployResources = async (
  state: EntryStates,
  metadata: MetadataReflection,
  context: EventContext,
  options: DeployOptions
) => {
  const allPrepareEvents = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    const preparedEvent = triggerAllAsync('deploy:prepareResources', (handler) =>
      handler({
        state,
        service,
        options,
        context
      })
    );

    allPrepareEvents.push(preparedEvent);
  }

  await Promise.all(allPrepareEvents);
};

export const connectDeployResources = async (
  state: EntryStates,
  metadata: MetadataReflection,
  context: EventContext,
  options: DeployOptions
) => {
  const allPrepareEvents = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    const preparedEvent = triggerAllAsync('deploy:connectResources', (handler) =>
      handler({
        state,
        service,
        options,
        context
      })
    );

    allPrepareEvents.push(preparedEvent);
  }

  await Promise.all(allPrepareEvents);
};
