import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LinkedVariables } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { LogGroupState } from '@ez4/aws-logs';
import type { IntegrationFunctionParameters } from './types';
import type { BundleFunction } from './bundler';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';
import { LogLevel } from '@ez4/project';

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
  const { type, handler, variables, debug, architecture, preferences, errorsMap } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'apiEntryPoint',
    sourceFile: handler.sourceFile,
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
    vpc: parameters.vpc,
    getFunctionVariables: () => {
      return variables.reduce<LinkedVariables>((variables, current) => ({ ...variables, ...current }), {});
    },
    getFunctionBundle: (context) => {
      return bundleFunctions[type](parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionFiles: () => {
      return [handler.sourceFile, handler.dependencies];
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
        errorsMap,
        debug
      });
    }
  });
};
