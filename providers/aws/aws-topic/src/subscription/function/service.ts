import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LinkedVariables } from '@ez4/project/library';
import type { LogGroupState } from '@ez4/aws-logs';
import type { RoleState } from '@ez4/aws-identity';
import type { SubscriptionFunctionParameters } from './types';

import { createFunction } from '@ez4/aws-function';
import { hashObject } from '@ez4/utils';
import { LogLevel } from '@ez4/project';

import { bundleSubscriptionFunction } from './bundler';

export const createSubscriptionFunction = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  logGroupState: LogGroupState,
  parameters: SubscriptionFunctionParameters
) => {
  const { handler, variables, debug, architecture, messageSchema } = parameters;

  return createFunction(state, roleState, logGroupState, {
    handlerName: 'snsEntryPoint',
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
      return bundleSubscriptionFunction(parameters, [...context.getDependencies(), ...context.getConnections()]);
    },
    getFunctionFiles: () => {
      return [handler.sourceFile, handler.dependencies];
    },
    getFunctionHash: () => {
      return hashObject({
        architecture,
        messageSchema,
        debug
      });
    }
  });
};
