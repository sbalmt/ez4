import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { StreamFunctionParameters } from './types.js';

import { createFunction as baseCreateFunction } from '@ez4/aws-function';

import { bundleStreamFunction } from './bundler.js';

export const createStreamFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: StreamFunctionParameters
) => {
  return baseCreateFunction(state, roleState, {
    ...parameters,
    handlerName: 'dbStreamEntryPoint',
    getFunctionBundle: async () => {
      return bundleStreamFunction(parameters);
    }
  });
};
