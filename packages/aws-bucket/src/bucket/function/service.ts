import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { BucketEventFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleBucketEventFunction } from './bundler.js';

export const createBucketEventFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: BucketEventFunctionParameters
) => {
  return createFunction(state, roleState, {
    handlerName: 's3EntryPoint',
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
      return bundleBucketEventFunction(dependencies, parameters);
    }
  });
};
