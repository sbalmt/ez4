import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IntegrationFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleApiFunction } from './bundler.js';

export const createIntegrationFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: IntegrationFunctionParameters
) => {
  return createFunction(state, roleState, {
    ...parameters,
    handlerName: 'apiEntryPoint',
    getFunctionBundle: () => {
      return bundleApiFunction(state, parameters);
    }
  });
};
