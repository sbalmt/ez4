import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { SubscriptionFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleSubscriptionFunction } from './bundler.js';

export const createSubscriptionFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: SubscriptionFunctionParameters
) => {
  const { handler } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'snsEntryPoint',
    sourceFile: handler.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
    variables: parameters.variables,
    timeout: parameters.timeout,
    memory: parameters.memory,
    debug: parameters.debug,
    tags: parameters.tags,
    getFunctionBundle: (context) => {
      const dependencies = context.getDependencies();
      return bundleSubscriptionFunction(dependencies, parameters);
    },
    getFunctionFiles: () => {
      return [handler.sourceFile, handler.dependencies];
    }
  });
};
