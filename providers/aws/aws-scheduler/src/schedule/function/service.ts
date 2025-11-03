import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { TargetFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';

import { bundleTargetFunction } from './bundler';

export const createTargetFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: TargetFunctionParameters
) => {
  const { handler, eventSchema } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'eventEntryPoint',
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
      return bundleTargetFunction(parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionHash: () => {
      return hashObject({ eventSchema });
    }
  });
};
