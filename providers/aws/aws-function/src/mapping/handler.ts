import type { StepContext, StepHandler } from '@ez4/stateful';
import type { MappingParameters, MappingResult, MappingState } from './types';
import type { UpdateRequest } from './client';

import { CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
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

const createResource = (candidate: MappingState, context: StepContext): Promise<MappingResult> => {
  const parameters = candidate.parameters;

  const functionName = getFunctionName(MappingServiceName, 'mapping', context);

  return Logger.logOperation(MappingServiceName, functionName, 'creation', async (logger) => {
    const sourceArn = await parameters.getSourceArn(context);

    const response =
      (await importMapping(logger, functionName, sourceArn)) ??
      (await createMapping(logger, {
        ...candidate.parameters,
        functionName,
        sourceArn
      }));

    return {
      eventId: response.eventId,
      functionName,
      sourceArn
    };
  });
};

const updateResource = (candidate: MappingState, current: MappingState, context: StepContext): Promise<MappingResult> => {
  const { result, parameters } = candidate;
  const { fromService } = parameters;

  if (!result) {
    throw new CorruptedResourceError(MappingServiceName, 'mapping');
  }

  return Logger.logOperation(MappingServiceName, fromService, 'updates', async (logger) => {
    const newFunctionName = getFunctionName(MappingServiceName, 'mapping', context);
    const oldFunctionName = current.result?.functionName ?? result.functionName;

    const sourceArn = result.sourceArn;

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

    await checkGeneralUpdates(logger, result.eventId, newRequest, oldRequest);

    return {
      ...result,
      functionName: newFunctionName
    };
  });
};

const deleteResource = async (current: MappingState) => {
  const result = current.result;

  if (!result) {
    return;
  }

  const { functionName } = result;

  await Logger.logOperation(MappingServiceName, functionName, 'deletion', async (logger) => {
    await deleteMapping(logger, result.eventId);
  });
};

const checkGeneralUpdates = async (
  logger: Logger.OperationLogger,
  eventId: string,
  candidate: MappingUpdateParameters,
  current: MappingUpdateParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      getSourceArn: true,
      fromService: true
    }
  });

  if (hasChanges) {
    await updateMapping(logger, eventId, candidate);
  }
};
