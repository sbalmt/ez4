import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types.js';

import { createFunction as baseCreateFunction } from '@ez4/aws-function';

import { bundleQueueFunction } from './bundler.js';

export const createQueueFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: QueueFunctionParameters
) => {
  return baseCreateFunction(state, roleState, {
    ...parameters,
    handlerName: 'sqsEntryPoint',
    getFunctionBundle: async () => {
      return bundleQueueFunction(parameters);
    }
  });
};
