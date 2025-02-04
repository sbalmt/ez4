import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { StreamFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleStreamFunction } from './bundler.js';

export const createStreamFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: StreamFunctionParameters
) => {
  return createFunction(state, roleState, {
    handlerName: 'dbStreamEntryPoint',
    functionName: parameters.functionName,
    sourceFile: parameters.sourceFile,
    variables: parameters.variables,
    description: parameters.description,
    timeout: parameters.timeout,
    memory: parameters.memory,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();
      return bundleStreamFunction(dependencies, parameters);
    }
  });
};
