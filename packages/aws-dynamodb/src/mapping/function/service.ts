import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { StreamFunctionParameters } from './types.js';

import { createFunction } from '@ez4/aws-function';

import { bundleStreamFunction } from './bundler.js';

export const createStreamFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: StreamFunctionParameters
) => {
  const { handler } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'dbStreamEntryPoint',
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
      return bundleStreamFunction(dependencies, parameters);
    },
    getFunctionFiles: () => {
      return [handler.sourceFile, handler.dependencies];
    }
  });
};
