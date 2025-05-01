import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { QueueFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleQueueFunction } from './bundler.js';

export const createQueueFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: QueueFunctionParameters
) => {
  const queueFunctionName = parameters.functionName;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'sqsEntryPoint',
    functionName: queueFunctionName,
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
