import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleQueueFunction } from './bundler.js';

export const createQueueFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: QueueFunctionParameters
) => {
  return createFunction(state, roleState, {
    handlerName: 'sqsEntryPoint',
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
      return bundleQueueFunction(dependencies, parameters);
    }
  });
};
