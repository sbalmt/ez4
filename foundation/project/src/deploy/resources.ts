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

    const successful = await triggerAllAsync('deploy:prepareResources', (handler) => {
      return handler({ state, service, options, context });
    });

    if (!successful) {
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

    const promise = triggerAllAsync('deploy:connectResources', (handler) => {
      return handler({ state, service, options, context });
    });

    allPrepareEvents.push(promise);
  }

  await Promise.all(allPrepareEvents);
};
