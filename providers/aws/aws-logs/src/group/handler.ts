import type { StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { LogGroupState, LogGroupResult, LogGroupParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createGroup, deleteGroup, createRetention, deleteRetention, tagGroup, untagGroup } from './client';
import { LogGroupServiceName } from './types';

export const getLogGroupHandler = (): StepHandler<LogGroupState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: LogGroupState, current: LogGroupState) => {
  return !!candidate.result && candidate.result.groupArn === current.result?.groupArn;
};

const previewResource = (candidate: LogGroupState, current: LogGroupState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.groupName
  };
};

const replaceResource = async (candidate: LogGroupState, current: LogGroupState) => {
  if (current.result) {
    throw new ReplaceResourceError(LogGroupServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: LogGroupState): Promise<LogGroupResult> => {
  const { parameters } = candidate;

  return Logger.logOperation(LogGroupServiceName, parameters.groupName, 'creation', async (logger) => {
    const { groupArn } = await createGroup(logger, parameters);

    await checkGeneralUpdates(logger, parameters.groupName, parameters);

    return {
      groupArn
    };
  });
};

const updateResource = (candidate: LogGroupState, current: LogGroupState): Promise<LogGroupResult> => {
  const { result, parameters } = candidate;
  const { groupName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(LogGroupServiceName, groupName);
  }

  return Logger.logOperation(LogGroupServiceName, groupName, 'updates', async (logger) => {
    await checkGeneralUpdates(logger, groupName, parameters, current.parameters);
    await checkTagUpdates(logger, result.groupArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: LogGroupState) => {
  const { parameters, result } = current;

  if (!result) {
    return;
  }

  await Logger.logOperation(LogGroupServiceName, parameters.groupName, 'deletion', async (logger) => {
    await deleteGroup(logger, parameters.groupName);
  });
};

const checkTagUpdates = async (
  logger: Logger.OperationLogger,
  policyArn: Arn,
  candidate: LogGroupParameters,
  current: LogGroupParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagGroup(logger, policyArn, tags),
    (tags) => untagGroup(logger, policyArn, tags)
  );
};

const checkGeneralUpdates = async (
  logger: Logger.OperationLogger,
  groupName: string,
  candidate: LogGroupParameters,
  current?: LogGroupParameters
) => {
  if (candidate.retention === current?.retention) {
    return;
  }

  if (candidate.retention) {
    return createRetention(logger, groupName, candidate.retention);
  }

  return deleteRetention(logger, groupName);
};
