import type { Arn } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { StageState, StageResult, StageParameters } from './types';

import { deepCompare, deepEqual } from '@ez4/utils';
import { ReplaceResourceError } from '@ez4/aws-common';
import { tryGetLogGroupArn } from '@ez4/aws-logs';

import { getGatewayId } from '../gateway/utils';
import { getStageName } from './helpers/stage';
import { createStage, deleteStage, disableAccessLogs, enableAccessLogs, importStage, updateStage } from './client';
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
  const logGroupArn = tryGetLogGroupArn(context);
  const apiId = getGatewayId(StageServiceName, stageName, context);

  const importedStage = await importStage(apiId, stageName);

  if (importedStage) {
    if (logGroupArn) {
      await enableAccessLogs(apiId, stageName, logGroupArn);
    }

    return {
      stageName: importedStage.stageName,
      logGroupArn,
      apiId
    };
  }

  const createdStage = await createStage(apiId, {
    ...parameters,
    stageName
  });

  if (logGroupArn) {
    await enableAccessLogs(apiId, stageName, logGroupArn);
  }

  return {
    stageName: createdStage.stageName,
    logGroupArn,
    apiId
  };
};

const updateResource = async (candidate: StageState, current: StageState, context: StepContext) => {
  const { parameters: newParameters, result } = candidate;
  const { parameters: oldParameters } = current;

  if (!result) {
    return;
  }

  const newLogGroupArn = tryGetLogGroupArn(context);
  const oldLogGroupArn = current.result?.logGroupArn;

  await checkAccessLogUpdates(result.apiId, result.stageName, newLogGroupArn, oldLogGroupArn);
  await checkGeneralUpdates(result.apiId, result.stageName, newParameters, oldParameters);

  return {
    ...result,
    logGroupArn: newLogGroupArn
  };
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

const checkAccessLogUpdates = async (apiId: string, stageName: string, candidate: Arn | undefined, current: Arn | undefined) => {
  if (candidate !== current) {
    if (candidate) {
      return enableAccessLogs(apiId, stageName, candidate);
    }

    if (current) {
      return disableAccessLogs(apiId, stageName);
    }
  }
};
