import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LinkedVariables } from '@ez4/project/library';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { AuthorizerFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';
import { LogLevel } from '@ez4/project';

import { bundleApiFunction } from './bundler';

export const createAuthorizerFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: AuthorizerFunctionParameters
) => {
  const { authorizer, variables, debug, architecture, preferences } = parameters;
  const { headersSchema, parametersSchema, querySchema } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'apiEntryPoint',
    sourceFile: authorizer.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
    logLevel: debug ? LogLevel.Debug : parameters.logLevel,
    architecture: parameters.architecture,
    runtime: parameters.runtime,
    release: parameters.release,
    timeout: parameters.timeout,
    memory: parameters.memory,
    files: parameters.files,
    tags: parameters.tags,
    getFunctionVariables: () => {
      return variables.reduce<LinkedVariables>((variables, current) => ({ ...variables, ...current }), {});
    },
    getFunctionBundle: (context) => {
      return bundleApiFunction(parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionFiles: () => {
      return [authorizer.sourceFile, authorizer.dependencies];
    },
    getFunctionHash: () => {
      return hashObject({
        architecture,
        headersSchema,
        parametersSchema,
        querySchema,
        preferences,
        debug
      });
    }
  });
};
