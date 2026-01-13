import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LinkedVariables } from '@ez4/project/library';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { StreamFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';

import { bundleStreamFunction } from './bundler';

export const createStreamFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: StreamFunctionParameters
) => {
  const { handler, variables, architecture, tableSchema } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'dbStreamEntryPoint',
    sourceFile: handler.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
    architecture: parameters.architecture,
    runtime: parameters.runtime,
    release: parameters.release,
    timeout: parameters.timeout,
    memory: parameters.memory,
    debug: parameters.debug,
    tags: parameters.tags,
    getFunctionVariables: () => {
      return variables.reduce<LinkedVariables>((variables, current) => ({ ...variables, ...current }), {});
    },
    getFunctionFiles: () => {
      return [handler.sourceFile, handler.dependencies];
    },
    getFunctionBundle: (context) => {
      return bundleStreamFunction(parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionHash: () => {
      return hashObject({
        architecture,
        tableSchema
      });
    }
  });
};
