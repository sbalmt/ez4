import type { StepContext, StepHandler } from '@ez4/stateful';
import type { MappingParameters, MappingResult, MappingState } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { getFunctionName } from '@ez4/aws-function';
import { deepEqual } from '@ez4/utils';

import { getQueueArn } from '../queue/utils.js';
import { createMapping, deleteMapping, updateMapping } from './client.js';
import { MappingServiceName } from './types.js';

export const getMappingHandler = (): StepHandler<MappingState> => ({
  equals: equalsResource,
  replace: replaceResource,
  create: createResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: MappingState, current: MappingState) => {
  return !!candidate.result && candidate.result.eventId === current.result?.eventId;
};

const replaceResource = async (
  candidate: MappingState,
  current: MappingState,
  context: StepContext<MappingState>
) => {
  if (current.result) {
    throw new ReplaceResourceError(MappingServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: MappingState,
  context: StepContext
): Promise<MappingResult> => {
  const functionName = getFunctionName(MappingServiceName, 'mapping', context);
  const queueArn = getQueueArn(MappingServiceName, 'mapping', context);

  const response = await createMapping({
    ...candidate.parameters,
    functionName,
    queueArn
  });

  return {
    eventId: response.eventId,
    functionName,
    queueArn
  };
};

const updateResource = async (
  candidate: MappingState,
  current: MappingState,
  context: StepContext
) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const newFunctionName = getFunctionName(MappingServiceName, 'mapping', context);
  const oldFunctionName = current.result?.functionName ?? result.functionName;

  const newRequest = { ...candidate.parameters, functionName: newFunctionName };
  const oldRequest = { ...current.parameters, functionName: oldFunctionName };

  await checkGeneralUpdates(result.eventId, newRequest, oldRequest);

  return {
    ...result,
    functionName: newFunctionName
  };
};

const deleteResource = async (candidate: MappingState) => {
  const result = candidate.result;

  if (result) {
    await deleteMapping(result.eventId);
  }
};

const checkGeneralUpdates = async <T extends MappingParameters>(
  eventId: string,
  candidate: T,
  current: T
) => {
  if (!deepEqual(candidate, current)) {
    await updateMapping(eventId, candidate);
  }
};
