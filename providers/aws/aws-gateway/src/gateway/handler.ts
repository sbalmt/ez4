import type { StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { GatewayState, GatewayResult, GatewayParameters } from './types';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createGateway, deleteCorsConfiguration, deleteGateway, fetchGateway, tagGateway, untagGateway, updateGateway } from './client';
import { GatewayProtocol, GatewayServiceName } from './types';

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

const previewResource = (candidate: GatewayState, current: GatewayState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.gatewayName ?? source.gatewayName
  };
};

const replaceResource = async (candidate: GatewayState, current: GatewayState) => {
  if (current.result) {
    throw new ReplaceResourceError(GatewayServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: GatewayState): Promise<GatewayResult> => {
  const { parameters } = candidate;

  if (parameters.import) {
    const { apiId, apiArn, endpoint } = await fetchGateway(parameters.gatewayName);

    return {
      apiId,
      apiArn,
      endpoint
    };
  }

  const { apiId, apiArn, endpoint } = await createGateway(candidate.parameters);

  return {
    apiId,
    apiArn,
    endpoint
  };
};

const updateResource = async (candidate: GatewayState, current: GatewayState) => {
  const { result, parameters } = candidate;

  if (!result || parameters.import) {
    return;
  }

  const { apiId, apiArn } = result;

  await checkGeneralUpdates(apiId, parameters, current.parameters);
  await checkTagUpdates(apiArn, parameters, current.parameters);
};

const deleteResource = async (candidate: GatewayState) => {
  const { result, parameters } = candidate;

  if (result && !parameters.import) {
    await deleteGateway(result.apiId);
  }
};

const checkGeneralUpdates = async (apiId: string, candidate: GatewayParameters, current: GatewayParameters) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      tags: true
    }
  });

  if (hasChanges) {
    await updateGateway(apiId, candidate);
  }

  if (candidate.protocol === GatewayProtocol.Http && current.protocol === GatewayProtocol.Http && !candidate.cors && current.cors) {
    await deleteCorsConfiguration(apiId);
  }
};

const checkTagUpdates = async (apiArn: Arn, candidate: GatewayParameters, current: GatewayParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagGateway(apiArn, tags),
    (tags) => untagGateway(apiArn, tags)
  );
};
