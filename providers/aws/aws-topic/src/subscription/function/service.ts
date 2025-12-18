import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionVariables } from '@ez4/aws-function';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { SubscriptionFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';

import { bundleSubscriptionFunction } from './bundler';

export const createSubscriptionFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: SubscriptionFunctionParameters
) => {
  const { handler, variables, messageSchema } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'snsEntryPoint',
    sourceFile: handler.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
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
      return bundleSubscriptionFunction(parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionHash: () => {
      return hashObject({ messageSchema });
    }
  });
};
