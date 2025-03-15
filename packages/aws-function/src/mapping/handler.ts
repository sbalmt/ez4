import type { StepContext, StepHandler } from '@ez4/stateful';
import type { MappingResult, MappingState } from './types.js';
import type { CreateRequest } from './client.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { getFunctionName } from '../function/utils.js';
import { importMapping, createMapping, deleteMapping, updateMapping } from './client.js';
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

  await checkGeneralUpdates(
    result.eventId,
    {
      ...candidate.parameters,
      functionName: newFunctionName,
      sourceArn
    },
    {
      ...current.parameters,
      functionName: oldFunctionName,
      sourceArn
    }
  );

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

const checkGeneralUpdates = async <T extends CreateRequest>(eventId: string, candidate: T, current: T) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateMapping(eventId, candidate);
  }
};
