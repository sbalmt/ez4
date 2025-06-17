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
  const allEvents = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    const event = triggerAllAsync('deploy:prepareResources', (handler) =>
      handler({
        state,
        service,
        options,
        context
      })
    );

    allEvents.push(event);
  }

  await Promise.all(allEvents);
};

export const connectDeployResources = async (
  state: EntryStates,
  metadata: MetadataReflection,
  context: EventContext,
  options: DeployOptions
) => {
  const allEvents = [];

  for (const identity in metadata) {
    const service = metadata[identity];

    const event = triggerAllAsync('deploy:connectResources', (handler) =>
      handler({
        state,
        service,
        options,
        context
      })
    );

    allEvents.push(event);
  }

  await Promise.all(allEvents);
};
