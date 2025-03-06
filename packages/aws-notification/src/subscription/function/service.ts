import type { RoleState } from '@ez4/aws-identity';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { SubscriptionFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleSubscriptionFunction } from './bundler.js';

export const createSubscriptionFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  parameters: SubscriptionFunctionParameters
) => {
  return createFunction(state, roleState, {
    handlerName: 'snsEntryPoint',
    functionName: parameters.functionName,
    sourceFile: parameters.handler.sourceFile,
    description: parameters.description,
    variables: parameters.variables,
    timeout: parameters.timeout,
    memory: parameters.memory,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();
      return bundleSubscriptionFunction(dependencies, parameters);
    }
  });
};
