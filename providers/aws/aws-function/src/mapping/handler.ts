import type { StepContext, StepHandler } from '@ez4/stateful';
import type { MappingParameters, MappingResult, MappingState } from './types';
import type { UpdateRequest } from './client';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getFunctionName } from '../function/utils';
import { importMapping, createMapping, deleteMapping, updateMapping } from './client';
import { MappingServiceName } from './types';

type MappingUpdateParameters = MappingParameters & UpdateRequest;

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

const previewResource = (candidate: MappingState, current: MappingState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source, {
    exclude: {
      getSourceArn: true
    }
  });

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.fromService
  };
};

const replaceResource = async (candidate: MappingState, current: MappingState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(MappingServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: MappingState, context: StepContext): Promise<MappingResult> => {
  const parameters = candidate.parameters;

  const functionName = getFunctionName(MappingServiceName, 'mapping', context);
  const sourceArn = await parameters.getSourceArn(context);

  const response =
    (await importMapping(functionName, sourceArn)) ??
    (await createMapping({
      ...candidate.parameters,
      functionName,
      sourceArn
    }));

  return {
    eventId: response.eventId,
    functionName,
    sourceArn
  };
};

const updateResource = async (candidate: MappingState, current: MappingState, context: StepContext) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const sourceArn = result.sourceArn;

  const newFunctionName = getFunctionName(MappingServiceName, 'mapping', context);
  const oldFunctionName = current.result?.functionName ?? result.functionName;

  const newRequest = {
    ...candidate.parameters,
    functionName: newFunctionName,
    sourceArn
  };

  const oldRequest = {
    ...current.parameters,
    functionName: oldFunctionName,
    sourceArn
  };

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

const checkGeneralUpdates = async (eventId: string, candidate: MappingUpdateParameters, current: MappingUpdateParameters) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      getSourceArn: true,
      fromService: true
    }
  });

  if (hasChanges) {
    await updateMapping(eventId, candidate);
  }
};
