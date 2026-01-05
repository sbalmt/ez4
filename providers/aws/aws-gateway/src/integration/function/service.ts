import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LinkedVariables } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { LogGroupState } from '@ez4/aws-logs';
import type { IntegrationFunctionParameters } from './types';
import type { BundleFunction } from './bundler';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';

import { bundleConnectionFunction, bundleMessageFunction, bundleRequestFunction } from './bundler';
import { IntegrationFunctionType } from './types';

const bundleFunctions: Record<IntegrationFunctionType, BundleFunction> = {
  [IntegrationFunctionType.HttpRequest]: bundleRequestFunction,
  [IntegrationFunctionType.WsConnection]: bundleConnectionFunction,
  [IntegrationFunctionType.WsMessage]: bundleMessageFunction
};

export const createIntegrationFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: IntegrationFunctionParameters
) => {
  const { headersSchema, parametersSchema, querySchema, bodySchema, identitySchema, responseSchema } = parameters;
  const { type, handler, variables, architecture, preferences, errorsMap } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'apiEntryPoint',
    sourceFile: handler.sourceFile,
    functionName: parameters.functionName,
    description: parameters.description,
    architecture: parameters.architecture,
    runtime: parameters.runtime,
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
      return bundleFunctions[type](parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionHash: () => {
      return hashObject({
        architecture,
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
