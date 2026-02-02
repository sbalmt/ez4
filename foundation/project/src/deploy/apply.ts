import type { EntryStates } from '@ez4/stateful';
import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';

import { MissingActionProviderError } from '../errors/provider';

export const applyDeploy = async (newState: EntryStates, oldState: EntryStates, options: DeployOptions) => {
  const { concurrency, force } = options;

  const result = await triggerAllAsync('deploy:apply', (handler) => {
    return handler({ newState, oldState, concurrency, force });
  });

  if (!result) {
    throw new MissingActionProviderError('deploy:apply');
  }

  return result;
};
