import type { StepContext, StepHandler } from '@ez4/stateful';
import type { StageState, StageResult, StageParameters } from './types';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getGatewayId } from '../gateway/utils';
import { createStage, deleteStage, importStage, updateStage } from './client';
import { getStageName } from './helpers/stage';
import { StageServiceName } from './types';

export const getStageHandler = (): StepHandler<StageState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: StageState, current: StageState) => {
  return !!candidate.result && candidate.result.stageName === current.result?.stageName;
};

const previewResource = (candidate: StageState, current: StageState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return changes.counts ? changes : undefined;
};

const replaceResource = async (candidate: StageState, current: StageState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(StageServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: StageState, context: StepContext): Promise<StageResult> => {
  const parameters = candidate.parameters;

  const stageName = getStageName(parameters);
  const apiId = getGatewayId(StageServiceName, stageName, context);

  const response =
    (await importStage(apiId, stageName)) ??
    (await createStage(apiId, {
      ...parameters,
      stageName
    }));

  return {
    stageName: response.stageName,
    apiId
  };
};

const updateResource = async (candidate: StageState, current: StageState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  await checkGeneralUpdates(result.apiId, result.stageName, candidate.parameters, current.parameters);
};

const deleteResource = async (candidate: StageState) => {
  const result = candidate.result;

  if (result) {
    await deleteStage(result.apiId, result.stageName);
  }
};

const checkGeneralUpdates = async (apiId: string, stageName: string, candidate: StageParameters, current: StageParameters) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      stageName: true
    }
  });

  if (hasChanges) {
    await updateStage(apiId, stageName, candidate);
  }
};
