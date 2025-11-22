import type { EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/stateful';
import type { MetadataReflection } from '../types/metadata';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { MissingResourceProvider } from '../errors/provider';

export const prepareDeployResources = async (
  state: EntryStates,
  metadata: MetadataReflection,
  context: EventContext,
  options: DeployOptions
) => {
  for (const identity in metadata) {
    const service = metadata[identity];

    const result = await triggerAllAsync('deploy:prepareResources', (handler) =>
      handler({
        state,
        service,
        options,
        context
      })
    );

    if (!result) {
      throw new MissingResourceProvider(service.name);
    }
  }
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

    const result = triggerAllAsync('deploy:connectResources', (handler) =>
      handler({
        state,
        service,
        options,
        context
      })
    );

    allPrepareEvents.push(result);
  }

  await Promise.all(allPrepareEvents);
};
