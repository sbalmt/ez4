import type { EntryState, EntryStates } from '@ez4/stateful';
import type { ServiceAliases } from '@ez4/project/library';
import type { MetadataReflection } from '../types/metadata.js';
import type { DeployOptions } from '../types/options.js';

import { triggerAllAsync } from '@ez4/project/library';

import { getEventContext } from './common.js';

export const prepareDeployResources = async (
  aliases: ServiceAliases,
  state: EntryStates,
  metadata: MetadataReflection,
  role: EntryState | null,
  options: DeployOptions
) => {
  const allEvents = [];

  const context = getEventContext(aliases, role);

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
  aliases: ServiceAliases,
  state: EntryStates,
  metadata: MetadataReflection,
  role: EntryState | null,
  options: DeployOptions
) => {
  const allEvents = [];

  const context = getEventContext(aliases, role);

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
