import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionVariables } from '@ez4/aws-function';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { QueueFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';

import { bundleQueueFunction } from './bundler';

export const createQueueFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: QueueFunctionParameters
) => {
  const { handler, variables, messageSchema } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'sqsEntryPoint',
    sourceFile: handler.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
    architecture: parameters.architecture,
    runtime: parameters.runtime,
    timeout: parameters.timeout,
    memory: parameters.memory,
    debug: parameters.debug,
    tags: parameters.tags,
    getFunctionVariables: () => {
      return variables.reduce<FunctionVariables>((variables, current) => ({ ...variables, ...current }), {});
    },
    getFunctionFiles: () => {
      return [handler.sourceFile, handler.dependencies];
    },
    getFunctionBundle: (context) => {
      return bundleQueueFunction(parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionHash: () => {
      return hashObject({ messageSchema });
    }
  });
};
