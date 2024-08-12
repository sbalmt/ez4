import type { StepContext, StepHandler } from '@ez4/stateful';
import type { MappingParameters, MappingResult, MappingState } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getFunctionName } from '../function/utils.js';
import { createMapping, deleteMapping, updateMapping } from './client.js';
import { MappingServiceName } from './types.js';

export const getMappingHandler = (): StepHandler<MappingState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: MappingState, current: MappingState) => {
  return !!candidate.result && candidate.result.eventId === current.result?.eventId;
};

const previewResource = async (candidate: MappingState, current: MappingState) => {
  const changes = deepCompare(candidate.parameters, current.parameters, {
    getSourceArn: true
  });

  return changes.counts ? changes : undefined;
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
  const parameters = candidate.parameters;

  const functionName = getFunctionName(MappingServiceName, 'mapping', context);
  const sourceArn = await parameters.getSourceArn(context);

  const response = await createMapping({
    ...candidate.parameters,
    functionName,
    sourceArn
  });

  return {
    eventId: response.eventId,
    functionName,
    sourceArn
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
  if (!deepEqual(candidate, current, { getSourceArn: true })) {
    await updateMapping(eventId, candidate);
  }
};
