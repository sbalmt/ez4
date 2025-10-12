import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { BucketEventFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';

import { bundleBucketEventFunction } from './bundler';

export const createBucketEventFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: BucketEventFunctionParameters
) => {
  const { handler } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 's3EntryPoint',
    sourceFile: handler.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
    variables: parameters.variables,
    timeout: parameters.timeout,
    memory: parameters.memory,
    debug: parameters.debug,
    tags: parameters.tags,
    getFunctionFiles: () => {
      return [handler.sourceFile, handler.dependencies];
    },
    getFunctionBundle: (context) => {
      return bundleBucketEventFunction(parameters, context.getConnections());
    },
    getFunctionHash: () => {
      return undefined;
    }
  });
};
