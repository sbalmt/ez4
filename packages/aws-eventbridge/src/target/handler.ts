import type { StepContext, StepHandler } from '@ez4/stateful';
import type { TargetState, TargetResult, TargetParameters } from './types.js';

import { getFunctionArn } from '@ez4/aws-function';
import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getRuleName } from '../rule/utils.js';
import { createTarget, deleteTarget, updateTarget } from './client.js';
import { TargetServiceName } from './types.js';

export const getTargetHandler = (): StepHandler<TargetState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: TargetState, current: TargetState) => {
  return !!candidate.result && candidate.result.targetId === current.result?.targetId;
};

const previewResource = async (candidate: TargetState, current: TargetState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  return changes.counts ? changes : undefined;
};

const replaceResource = async (
  candidate: TargetState,
  current: TargetState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(TargetServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: TargetState,
  context: StepContext
): Promise<TargetResult> => {
  const ruleName = getRuleName(TargetServiceName, 'target', context);
  const functionArn = getFunctionArn(TargetServiceName, 'target', context);

  const { targetId } = await createTarget(ruleName, {
    ...candidate.parameters,
    functionArn
  });

  return {
    ruleName,
    targetId,
    functionArn
  };
};

const updateResource = async (
  candidate: TargetState,
  current: TargetState,
  context: StepContext
) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const { ruleName, targetId } = result;

  const newFunctionArn = getFunctionArn(TargetServiceName, targetId, context);
  const oldFunctionArn = current.result?.functionArn ?? newFunctionArn;

  const newRequest = { ...candidate.parameters, functionArn: newFunctionArn };
  const oldRequest = { ...current.parameters, functionArn: oldFunctionArn };

  await checkGeneralUpdates(ruleName, targetId, newRequest, oldRequest);

  return {
    ...result,
    functionArn: newFunctionArn
  };
};

const deleteResource = async (candidate: TargetState) => {
  const result = candidate.result;

  if (result) {
    await deleteTarget(result.ruleName, result.targetId);
  }
};

const checkGeneralUpdates = async <T extends TargetParameters>(
  ruleName: string,
  targetId: string,
  candidate: T,
  current: T
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateTarget(ruleName, targetId, candidate);
  }
};
