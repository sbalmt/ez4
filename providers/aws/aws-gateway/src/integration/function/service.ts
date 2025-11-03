import type { EntryState, EntryStates } from '@ez4/stateful';
import type { RoleState } from '@ez4/aws-identity';
import type { LogGroupState } from '@ez4/aws-logs';
import type { IntegrationFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';

import { bundleApiFunction } from './bundler';

export const createIntegrationFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: IntegrationFunctionParameters
) => {
  const { headersSchema, parametersSchema, querySchema, bodySchema, identitySchema, responseSchema } = parameters;
  const { handler, preferences, errorsMap } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'apiEntryPoint',
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
      return bundleApiFunction(parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionHash: () => {
      return hashObject({
        headersSchema,
        parametersSchema,
        querySchema,
        bodySchema,
        identitySchema,
        responseSchema,
        preferences,
        errorsMap
      });
    }
  });
};
