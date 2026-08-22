import type { StepContext, StepHandler } from '@ez4/state';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { LogGroupState, LogGroupResult, LogGroupParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createGroup, deleteGroup, tagGroup, untagGroup, canDeleteGroup, putLogRetention, deleteLogRetention } from './client';
import { LogGroupNotEmptyError } from './errors';
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

const createResource = (candidate: LogGroupState): Promise<LogGroupResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(LogGroupServiceName, parameters.groupName, 'creation', async (logger) => {
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

  return OperationLogger.logExecution(LogGroupServiceName, groupName, 'updates', async (logger) => {
    await checkGeneralUpdates(logger, groupName, parameters, current.parameters);
    await checkTagUpdates(logger, result.groupArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: LogGroupState, context: StepContext) => {
  const { parameters, result } = current;

  if (result) {
    const { groupName } = parameters;

    await OperationLogger.logExecution(LogGroupServiceName, groupName, 'deletion', async (logger) => {
      if (!context.force) {
        const canDelete = await canDeleteGroup(logger, groupName);

        if (!canDelete) {
          throw new LogGroupNotEmptyError(groupName);
        }
      }

      await deleteGroup(logger, groupName);
    });
  }
};

const checkTagUpdates = async (logger: OperationLogLine, policyArn: Arn, candidate: LogGroupParameters, current: LogGroupParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagGroup(logger, policyArn, tags),
    (tags) => untagGroup(logger, policyArn, tags)
  );
};

const checkGeneralUpdates = async (
  logger: OperationLogLine,
  groupName: string,
  candidate: LogGroupParameters,
  current?: LogGroupParameters
) => {
  if (candidate.retention === current?.retention) {
    return;
  }

  if (candidate.retention) {
    return putLogRetention(logger, groupName, candidate.retention);
  }

  return deleteLogRetention(logger, groupName);
};
