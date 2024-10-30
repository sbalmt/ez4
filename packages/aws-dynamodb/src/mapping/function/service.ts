import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { StreamFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleStreamFunction } from './bundler.js';

export const createStreamFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: StreamFunctionParameters
) => {
  return createFunction(state, roleState, {
    ...parameters,
    handlerName: 'dbStreamEntryPoint',
    getFunctionBundle: () => {
      return bundleStreamFunction(state, parameters);
    }
  });
};
