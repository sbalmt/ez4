import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { GatewayState, GatewayResult, GatewayParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepEqual } from '@ez4/utils';

import { createGateway, deleteGateway, tagGateway, untagGateway, updateGateway } from './client.js';
import { GatewayServiceName } from './types.js';

export const getGatewayHandler = (): StepHandler<GatewayState> => ({
  equals: equalsResource,
  replace: replaceResource,
  create: createResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: GatewayState, current: GatewayState) => {
  return !!candidate.result && candidate.result.apiId === current.result?.apiId;
};

const replaceResource = async (candidate: GatewayState, current: GatewayState) => {
  if (current.result) {
    throw new ReplaceResourceError(GatewayServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: GatewayState): Promise<GatewayResult> => {
  const response = await createGateway(candidate.parameters);

  return {
    apiId: response.apiId,
    apiArn: response.apiArn,
    endpoint: response.endpoint
  };
};

const updateResource = async (candidate: GatewayState, current: GatewayState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  await Promise.all([
    checkGeneralUpdates(result.apiId, candidate.parameters, current.parameters),
    checkTagUpdates(result.apiArn, candidate.parameters, current.parameters)
  ]);

  return result;
};

const deleteResource = async (candidate: GatewayState) => {
  const result = candidate.result;

  if (result) {
    await deleteGateway(result.apiId);
  }
};

const checkGeneralUpdates = async (
  apiId: string,
  candidate: GatewayParameters,
  current: GatewayParameters
) => {
  const hasChanges = !deepEqual(candidate, current, { tags: true });

  if (hasChanges) {
    await updateGateway(apiId, candidate);
  }
};

const checkTagUpdates = async (
  apiArn: Arn,
  candidate: GatewayParameters,
  current: GatewayParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagGateway(apiArn, tags),
    (tags) => untagGateway(apiArn, tags)
  );
};
