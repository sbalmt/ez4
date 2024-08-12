import type { EntryStates } from '@ez4/stateful';

import { MissingProviderError } from '../errors/provider.js';
import { triggerAllAsync } from '../library/triggers.js';

export const applyDeploy = async (newState: EntryStates, oldState: EntryStates) => {
  const result = await triggerAllAsync('deploy:apply', (handler) =>
    handler({ newState, oldState })
  );

  if (!result) {
    throw new MissingProviderError('deploy:apply');
  }

  return result;
};
