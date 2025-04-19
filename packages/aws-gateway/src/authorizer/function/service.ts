import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { AuthorizerFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleApiFunction } from './bundler.js';

export const createAuthorizerFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: AuthorizerFunctionParameters
) => {
  return createFunction(state, roleState, {
    handlerName: 'apiEntryPoint',
    functionName: parameters.functionName,
    sourceFile: parameters.authorizer.sourceFile,
    description: parameters.description,
    variables: parameters.variables,
    timeout: parameters.timeout,
    memory: parameters.memory,
    debug: parameters.debug,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();
      return bundleApiFunction(dependencies, parameters);
    }
  });
};
