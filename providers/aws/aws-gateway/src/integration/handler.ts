import type { StepContext, StepHandler } from '@ez4/stateful';
import type { IntegrationState, IntegrationResult, IntegrationParameters } from './types';

import { getFunctionArn } from '@ez4/aws-function';
import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { GatewayProtocol } from '../gateway/types';
import { getGatewayId, getGatewayProtocol } from '../gateway/utils';
import { createIntegration, deleteIntegration, updateIntegration } from './client';
import { IntegrationServiceName } from './types';

export const getIntegrationHandler = (): StepHandler<IntegrationState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: IntegrationState, current: IntegrationState) => {
  return !!candidate.result && candidate.result.integrationId === current.result?.integrationId;
};

const previewResource = (candidate: IntegrationState, current: IntegrationState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return changes.counts ? changes : undefined;
};

const replaceResource = async (candidate: IntegrationState, current: IntegrationState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(IntegrationServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: IntegrationState, context: StepContext): Promise<IntegrationResult> => {
  const apiId = getGatewayId(IntegrationServiceName, 'integration', context);
  const functionArn = getFunctionArn(IntegrationServiceName, 'integration', context);
  const protocol = getGatewayProtocol(IntegrationServiceName, 'integration', context);

  const http = protocol === GatewayProtocol.Http;

  const response = await createIntegration(apiId, {
    ...candidate.parameters,
    functionArn,
    http
  });

  return {
    apiId,
    integrationId: response.integrationId,
    functionArn
  };
};

const updateResource = async (candidate: IntegrationState, current: IntegrationState, context: StepContext) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const integrationId = result.integrationId;

  const newFunctionArn = getFunctionArn(IntegrationServiceName, integrationId, context);
  const oldFunctionArn = current.result?.functionArn ?? newFunctionArn;

  const newRequest = { ...candidate.parameters, functionArn: newFunctionArn };
  const oldRequest = { ...current.parameters, functionArn: oldFunctionArn };

  const protocol = getGatewayProtocol(IntegrationServiceName, 'integration', context);

  await checkGeneralUpdates(result.apiId, integrationId, protocol, newRequest, oldRequest, context);

  return {
    ...result,
    functionArn: newFunctionArn
  };
};

const deleteResource = async (candidate: IntegrationState) => {
  const result = candidate.result;

  if (result) {
    await deleteIntegration(result.apiId, result.integrationId);
  }
};

const checkGeneralUpdates = async (
  apiId: string,
  integrationId: string,
  protocol: GatewayProtocol,
  candidate: IntegrationParameters,
  current: IntegrationParameters,
  context: StepContext
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      fromService: true
    }
  });

  if (hasChanges || context.force) {
    const http = protocol === GatewayProtocol.Http;

    await updateIntegration(apiId, integrationId, {
      ...candidate,
      http
    });
  }
};
