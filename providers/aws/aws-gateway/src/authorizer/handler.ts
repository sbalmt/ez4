import type { StepContext, StepHandler } from '@ez4/stateful';
import type { AuthorizerState, AuthorizerResult, AuthorizerParameters } from './types';

import { getFunctionArn } from '@ez4/aws-function';
import { CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { GatewayProtocol } from '../gateway/types';
import { getGatewayId, getGatewayProtocol } from '../gateway/utils';
import { createAuthorizer, deleteAuthorizer, updateAuthorizer } from './client';
import { AuthorizerServiceName } from './types';

export const getAuthorizerHandler = (): StepHandler<AuthorizerState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: AuthorizerState, current: AuthorizerState) => {
  return !!candidate.result && candidate.result.authorizerId === current.result?.authorizerId;
};

const previewResource = (candidate: AuthorizerState, current: AuthorizerState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return changes.counts ? changes : undefined;
};

const replaceResource = async (candidate: AuthorizerState, current: AuthorizerState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(AuthorizerServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: AuthorizerState, context: StepContext): Promise<AuthorizerResult> => {
  const { parameters } = candidate;

  return Logger.logOperation(AuthorizerServiceName, parameters.name, 'creation', async (logger) => {
    const apiId = getGatewayId(AuthorizerServiceName, 'authorizer', context);
    const functionArn = getFunctionArn(AuthorizerServiceName, 'authorizer', context);
    const protocol = getGatewayProtocol(AuthorizerServiceName, 'authorizer', context);

    const http = protocol === GatewayProtocol.Http;

    const response = await createAuthorizer(logger, apiId, {
      ...parameters,
      functionArn,
      http
    });

    return {
      apiId,
      authorizerId: response.authorizerId,
      functionArn
    };
  });
};

const updateResource = (candidate: AuthorizerState, current: AuthorizerState, context: StepContext): Promise<AuthorizerResult> => {
  const { result, parameters } = candidate;
  const { name } = parameters;

  if (!result) {
    throw new CorruptedResourceError(AuthorizerServiceName, name);
  }

  return Logger.logOperation(AuthorizerServiceName, name, 'updates', async (logger) => {
    const authorizerId = result.authorizerId;

    const newFunctionArn = getFunctionArn(AuthorizerServiceName, authorizerId, context);
    const oldFunctionArn = current.result?.functionArn ?? newFunctionArn;

    const newRequest = { ...parameters, functionArn: newFunctionArn };
    const oldRequest = { ...current.parameters, functionArn: oldFunctionArn };

    const protocol = getGatewayProtocol(AuthorizerServiceName, 'authorizer', context);

    await checkGeneralUpdates(logger, result.apiId, authorizerId, protocol, newRequest, oldRequest, context);

    return {
      ...result,
      functionArn: newFunctionArn
    };
  });
};

const deleteResource = async (current: AuthorizerState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  await Logger.logOperation(AuthorizerServiceName, parameters.name, 'deletion', async (logger) => {
    await deleteAuthorizer(logger, result.apiId, result.authorizerId);
  });
};

const checkGeneralUpdates = async (
  logger: Logger.OperationLogger,
  apiId: string,
  authorizerId: string,
  protocol: GatewayProtocol,
  candidate: AuthorizerParameters,
  current: AuthorizerParameters,
  context: StepContext
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges || context.force) {
    const http = protocol === GatewayProtocol.Http;

    await updateAuthorizer(logger, apiId, authorizerId, {
      ...candidate,
      http
    });
  }
};
