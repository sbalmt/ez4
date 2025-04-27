import type { StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { GroupState, GroupResult, GroupParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createGroup, deleteGroup, createRetention, deleteRetention, tagGroup, untagGroup } from './client.js';
import { GroupServiceName } from './types.js';

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

const previewResource = async (candidate: GroupState, current: GroupState) => {
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
  const parameters = candidate.parameters;

  const { groupArn } = await createGroup(parameters);

  await checkGeneralUpdates(parameters.groupName, parameters);

  return {
    groupArn
  };
};

const updateResource = async (candidate: GroupState, current: GroupState) => {
  const parameters = candidate.parameters;
  const result = candidate.result;

  if (result) {
    await checkGeneralUpdates(parameters.groupName, parameters, current.parameters);
    await checkTagUpdates(result.groupArn, parameters, current.parameters);
  }
};

const deleteResource = async (candidate: GroupState) => {
  const parameters = candidate.parameters;
  const result = candidate.result;

  if (result) {
    await deleteGroup(parameters.groupName);
  }
};

const checkTagUpdates = async (policyArn: Arn, candidate: GroupParameters, current: GroupParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagGroup(policyArn, tags),
    (tags) => untagGroup(policyArn, tags)
  );
};

const checkGeneralUpdates = async (groupName: string, candidate: GroupParameters, current?: GroupParameters) => {
  if (candidate.retention === current?.retention) {
    return;
  }

  if (candidate.retention) {
    return createRetention(groupName, candidate.retention);
  }

  return deleteRetention(groupName);
};
