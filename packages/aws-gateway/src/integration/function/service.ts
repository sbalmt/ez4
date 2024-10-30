import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IntegrationFunctionParameters } from './types.js';

import { createFunction as baseCreateFunction } from '@ez4/aws-function';

import { bundleApiFunction } from './bundler.js';

export const createIntegrationFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: IntegrationFunctionParameters
) => {
  return baseCreateFunction(state, roleState, {
    ...parameters,
    handlerName: 'apiEntryPoint',
    getFunctionBundle: async () => {
      return bundleApiFunction(parameters);
    }
  });
};
