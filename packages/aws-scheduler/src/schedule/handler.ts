import type { StepContext, StepHandler } from '@ez4/stateful';
import type { ScheduleState, ScheduleResult, ScheduleParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';
import { getFunctionArn } from '@ez4/aws-function';
import { getRoleArn } from '@ez4/aws-identity';

import { createSchedule, deleteSchedule, updateSchedule } from './client.js';
import { ScheduleServiceName } from './types.js';

export const getScheduleHandler = (): StepHandler<ScheduleState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: ScheduleState, current: ScheduleState) => {
  return !!candidate.result && candidate.result.scheduleArn === current.result?.scheduleArn;
};

const previewResource = async (candidate: ScheduleState, current: ScheduleState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.scheduleName
  };
};

const replaceResource = async (
  candidate: ScheduleState,
  current: ScheduleState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(ScheduleServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: ScheduleState,
  context: StepContext
): Promise<ScheduleResult> => {
  const roleArn = getRoleArn(ScheduleServiceName, 'schedule', context);
  const functionArn = getFunctionArn(ScheduleServiceName, 'schedule', context);

  const { scheduleArn } = await createSchedule({
    ...candidate.parameters,
    functionArn,
    roleArn
  });

  return {
    scheduleArn,
    functionArn,
    roleArn
  };
};

const updateResource = async (
  candidate: ScheduleState,
  current: ScheduleState,
  context: StepContext
) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { scheduleName } = parameters;

  const newRoleArn = getRoleArn(ScheduleServiceName, scheduleName, context);
  const oldRoleArn = current.result?.roleArn ?? newRoleArn;

  const newFunctionArn = getFunctionArn(ScheduleServiceName, scheduleName, context);
  const oldFunctionArn = current.result?.functionArn ?? newFunctionArn;

  const newRequest = { ...parameters, functionArn: newFunctionArn, roleArn: newRoleArn };
  const oldRequest = { ...current.parameters, functionArn: oldFunctionArn, roleArn: oldRoleArn };

  await checkGeneralUpdates(parameters.scheduleName, newRequest, oldRequest);
};

const deleteResource = async (candidate: ScheduleState) => {
  const { result, parameters } = candidate;

  if (result) {
    await deleteSchedule(parameters.scheduleName);
  }
};

const checkGeneralUpdates = async (
  scheduleName: string,
  candidate: ScheduleParameters,
  current: ScheduleParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      scheduleName: true
    }
  });

  if (hasChanges) {
    await updateSchedule(scheduleName, candidate);
  }
};
