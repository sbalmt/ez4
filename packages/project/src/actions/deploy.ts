import type { EntryStates } from '@ez4/stateful';

import { triggerAllAsync } from '@ez4/project/library';

import { MissingProviderError } from '../errors/provider.js';

export const applyDeploy = async (newState: EntryStates, oldState: EntryStates, force?: boolean) => {
  const result = await triggerAllAsync('deploy:apply', (handler) => handler({ newState, oldState, force }));

  if (!result) {
    throw new MissingProviderError('deploy:apply');
  }

  return result;
};
