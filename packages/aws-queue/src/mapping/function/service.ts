import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleQueueFunction } from './bundler.js';

export const createQueueFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: QueueFunctionParameters
) => {
  return createFunction(state, roleState, {
    ...parameters,
    handlerName: 'sqsEntryPoint',
    getFunctionBundle: () => {
      return bundleQueueFunction(state, parameters);
    }
  });
};
