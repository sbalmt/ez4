import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { GroupState, GroupResult, GroupParameters } from './types';

import { applyTagUpdates, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createGroup, deleteGroup, importGroup, tagGroup, untagGroup } from './client';
import { GroupServiceName } from './types';

export const getGroupHandler = (): StepHandler<GroupState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: GroupState, current: GroupState) => {
  return !!candidate.result && candidate.result.groupArn === current.result?.groupArn;
};

const previewResource = (candidate: GroupState, current: GroupState) => {
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

const replaceResource = async (candidate: GroupState, current: GroupState) => {
  if (current.result) {
    throw new ReplaceResourceError(GroupServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: GroupState): Promise<GroupResult> => {
  const { parameters } = candidate;

  return Logger.logOperation(GroupServiceName, parameters.groupName, 'creation', async (logger) => {
    const { groupArn } = (await importGroup(logger, parameters.groupName)) ?? (await createGroup(logger, parameters));

    return {
      groupArn
    };
  });
};

const updateResource = (candidate: GroupState, current: GroupState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  return Logger.logOperation(GroupServiceName, parameters.groupName, 'updates', async (logger) => {
    await checkTagUpdates(logger, result.groupArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: GroupState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  await Logger.logOperation(GroupServiceName, parameters.groupName, 'deletion', async (logger) => {
    await deleteGroup(logger, parameters.groupName);
  });
};

const checkTagUpdates = async (logger: Logger.OperationLogger, groupArn: Arn, candidate: GroupParameters, current: GroupParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagGroup(logger, groupArn, tags),
    (tags) => untagGroup(logger, groupArn, tags)
  );
};
