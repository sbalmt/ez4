import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { GatewayState, GatewayResult, GatewayParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createGateway, deleteGateway, tagGateway, untagGateway, updateGateway } from './client.js';
import { GatewayServiceName } from './types.js';

export const getGatewayHandler = (): StepHandler<GatewayState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: GatewayState, current: GatewayState) => {
  return !!candidate.result && candidate.result.apiId === current.result?.apiId;
};

const previewResource = async (candidate: GatewayState, current: GatewayState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.gatewayId
  };
};

const replaceResource = async (candidate: GatewayState, current: GatewayState) => {
  if (current.result) {
    throw new ReplaceResourceError(GatewayServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: GatewayState): Promise<GatewayResult> => {
  const { apiId, apiArn, endpoint } = await createGateway(candidate.parameters);

  return {
    apiId,
    apiArn,
    endpoint
  };
};

const updateResource = async (candidate: GatewayState, current: GatewayState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { apiId, apiArn } = result;

  await Promise.all([
    checkGeneralUpdates(apiId, parameters, current.parameters),
    checkTagUpdates(apiArn, parameters, current.parameters)
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
