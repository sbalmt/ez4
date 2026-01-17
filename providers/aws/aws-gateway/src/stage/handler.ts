import type { Arn } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { StageState, StageResult, StageParameters } from './types';

import { deepCompare, deepEqual } from '@ez4/utils';
import { CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
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
  const { parameters } = candidate;

  return Logger.logOperation(StageServiceName, parameters.stageName, 'creation', async (logger) => {
    const stageName = getStageName(parameters);
    const apiId = getGatewayId(StageServiceName, stageName, context);
    const logGroupArn = tryGetLogGroupArn(context);

    const importedStage = await importStage(logger, apiId, stageName);

    if (importedStage) {
      if (logGroupArn) {
        await enableAccessLogs(logger, apiId, stageName, logGroupArn);
      }

      return {
        stageName: importedStage.stageName,
        logGroupArn,
        apiId
      };
    }

    const createdStage = await createStage(logger, apiId, {
      ...parameters,
      stageName
    });

    if (logGroupArn) {
      await enableAccessLogs(logger, apiId, stageName, logGroupArn);
    }

    return {
      stageName: createdStage.stageName,
      logGroupArn,
      apiId
    };
  });
};

const updateResource = (candidate: StageState, current: StageState, context: StepContext): Promise<StageResult> => {
  const { parameters: newParameters, result } = candidate;
  const { stageName } = newParameters;

  if (!result) {
    throw new CorruptedResourceError(StageServiceName, stageName);
  }

  return Logger.logOperation(StageServiceName, stageName, 'updates', async (logger) => {
    const { parameters: oldParameters } = current;

    const newLogGroupArn = tryGetLogGroupArn(context);
    const oldLogGroupArn = current.result?.logGroupArn;

    await checkAccessLogUpdates(logger, result.apiId, stageName, newLogGroupArn, oldLogGroupArn);
    await checkGeneralUpdates(logger, result.apiId, stageName, newParameters, oldParameters);

    return {
      ...result,
      logGroupArn: newLogGroupArn
    };
  });
};

const deleteResource = async (current: StageState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  await Logger.logOperation(StageServiceName, parameters.stageName, 'deletion', async (logger) => {
    await deleteStage(logger, result.apiId, result.stageName);
  });
};

const checkGeneralUpdates = async (
  logger: Logger.OperationLogger,
  apiId: string,
  stageName: string,
  candidate: StageParameters,
  current: StageParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      stageName: true
    }
  });

  if (hasChanges) {
    await updateStage(logger, apiId, stageName, candidate);
  }
};

const checkAccessLogUpdates = async (
  logger: Logger.OperationLogger,
  apiId: string,
  stageName: string,
  candidate: Arn | undefined,
  current: Arn | undefined
) => {
  if (candidate !== current) {
    if (candidate) {
      return enableAccessLogs(logger, apiId, stageName, candidate);
    }

    if (current) {
      return disableAccessLogs(logger, apiId, stageName);
    }
  }
};
