import type { EntryState, EntryStates } from '@ez4/state';
import type { LinkedVariables } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { LogGroupState } from '@ez4/aws-logs';
import type { IntegrationFunctionParameters } from './types';
import type { BundleFunction } from './bundler';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';
import { LogLevel } from '@ez4/project';

import { bundleConnectionFunction, bundleMessageFunction, bundleRequestFunction, getBundleTemplateFile } from './bundler';
import { IntegrationFunctionType } from './types';

const BUNDLE_FUNCTIONS: Record<IntegrationFunctionType, BundleFunction> = {
  [IntegrationFunctionType.HttpRequest]: bundleRequestFunction,
  [IntegrationFunctionType.WsConnection]: bundleConnectionFunction,
  [IntegrationFunctionType.WsMessage]: bundleMessageFunction
};

const HANDLER_NAMES: Record<IntegrationFunctionType, string> = {
  [IntegrationFunctionType.HttpRequest]: 'httpRequestEntrypoint',
  [IntegrationFunctionType.WsConnection]: 'wsConnectionEntrypoint',
  [IntegrationFunctionType.WsMessage]: 'wsMessageEntrypoint'
};

export const createIntegrationFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: IntegrationFunctionParameters
) => {
  const { headersSchema, parametersSchema, querySchema, bodySchema, identitySchema, responseSchema } = parameters;
  const { type, handler, middlewares = [], variables, debug, architecture, preferences, errorsMap } = parameters;

  return createFunction(state, roleState, logGroupState, {
    sourceFile: handler.sourceFile,
    handlerName: HANDLER_NAMES[type],
    dependencies: parameters.dependencies,
    functionName: parameters.functionName,
    description: parameters.description,
    workspacePath: parameters.workspacePath,
    projectPrefix: parameters.projectPrefix,
    projectBranch: parameters.projectBranch,
    projectName: parameters.projectName,
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
      return BUNDLE_FUNCTIONS[type](parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionFiles: () => {
      return [handler.sourceFile, getBundleTemplateFile(type), ...handler.dependencies, ...middlewares.map(({ sourceFile }) => sourceFile)];
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
        middlewares,
        debug
      });
    }
  });
};
