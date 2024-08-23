import type { StepContext, StepHandler } from '@ez4/stateful';
import type { AuthorizerState, AuthorizerResult, AuthorizerParameters } from './types.js';

import { getFunctionArn } from '@ez4/aws-function';
import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getGatewayId } from '../gateway/utils.js';
import { createAuthorizer, deleteAuthorizer, updateAuthorizer } from './client.js';
import { AuthorizerServiceName } from './types.js';

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

const previewResource = async (candidate: AuthorizerState, current: AuthorizerState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return changes.counts ? changes : undefined;
};

const replaceResource = async (
  candidate: AuthorizerState,
  current: AuthorizerState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(AuthorizerServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: AuthorizerState,
  context: StepContext
): Promise<AuthorizerResult> => {
  const apiId = getGatewayId(AuthorizerServiceName, 'authorizer', context);
  const functionArn = getFunctionArn(AuthorizerServiceName, 'authorizer', context);

  const response = await createAuthorizer(apiId, {
    ...candidate.parameters,
    functionArn
  });

  return {
    apiId,
    authorizerId: response.authorizerId,
    functionArn
  };
};

const updateResource = async (
  candidate: AuthorizerState,
  current: AuthorizerState,
  context: StepContext
) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const authorizerId = result.authorizerId;

  const newFunctionArn = getFunctionArn(AuthorizerServiceName, authorizerId, context);
  const oldFunctionArn = current.result?.functionArn ?? newFunctionArn;

  const newRequest = { ...candidate.parameters, functionArn: newFunctionArn };
  const oldRequest = { ...current.parameters, functionArn: oldFunctionArn };

  await checkGeneralUpdates(result.apiId, authorizerId, newRequest, oldRequest);

  return {
    ...result,
    functionArn: newFunctionArn
  };
};

const deleteResource = async (candidate: AuthorizerState) => {
  const result = candidate.result;

  if (result) {
    await deleteAuthorizer(result.apiId, result.authorizerId);
  }
};

const checkGeneralUpdates = async <T extends AuthorizerParameters>(
  apiId: string,
  authorizerId: string,
  candidate: T,
  current: T
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateAuthorizer(apiId, authorizerId, candidate);
  }
};
