import type { EntryState, EntryStates } from '@ez4/stateful';
import type { RoleState } from '@ez4/aws-identity';
import type { LogGroupState } from '@ez4/aws-logs';
import type { IntegrationFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleApiFunction } from './bundler.js';

export const createIntegrationFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: IntegrationFunctionParameters
) => {
  return createFunction(state, roleState, logGroupState, {
    handlerName: 'apiEntryPoint',
    functionName: parameters.functionName,
    sourceFile: parameters.handler.sourceFile,
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
