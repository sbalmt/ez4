import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { AuthorizerFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';

import { bundleApiFunction } from './bundler';

export const createAuthorizerFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: AuthorizerFunctionParameters
) => {
  const { authorizer } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'apiEntryPoint',
    sourceFile: authorizer.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
    variables: parameters.variables,
    timeout: parameters.timeout,
    memory: parameters.memory,
    debug: parameters.debug,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();
      return bundleApiFunction(dependencies, parameters);
    },
    getFunctionFiles: () => {
      return [authorizer.sourceFile, authorizer.dependencies];
    }
  });
};
