import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { AuthorizerFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleApiFunction } from './bundler.js';

export const createAuthorizerFunction = async <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: AuthorizerFunctionParameters
) => {
  return createFunction(state, roleState, {
    ...parameters,
    handlerName: 'apiEntryPoint',
    getFunctionBundle: async () => {
      return bundleApiFunction(parameters);
    }
  });
};
