import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleTargetFunction } from './bundler.js';

export const createTargetFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: TargetFunctionParameters
) => {
  return createFunction(state, roleState, {
    handlerName: 'eventEntryPoint',
    functionName: parameters.functionName,
    sourceFile: parameters.handler.sourceFile,
    description: parameters.description,
    variables: parameters.variables,
    timeout: parameters.timeout,
    memory: parameters.memory,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();
      return bundleTargetFunction(dependencies, parameters);
    }
  });
};
