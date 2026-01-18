import type { StepHandler } from '@ez4/stateful';
import type { AccessState, AccessResult, AccessParameters } from './types';

import { CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createOriginAccess, updateOriginAccess, deleteOriginAccess } from './client';
import { AccessServiceName } from './types';

export const getAccessHandler = (): StepHandler<AccessState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: AccessState, current: AccessState) => {
  return !!candidate.result && candidate.result.accessId === current.result?.accessId;
};

const previewResource = (candidate: AccessState, current: AccessState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.accessName
  };
};

const replaceResource = async (candidate: AccessState, current: AccessState) => {
  if (current.result) {
    throw new ReplaceResourceError(AccessServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = (candidate: AccessState): Promise<AccessResult> => {
  const { parameters } = candidate;

  const accessName = parameters.accessName;

  return Logger.logOperation(AccessServiceName, accessName, 'creation', async (logger) => {
    const { accessId } = await createOriginAccess(logger, candidate.parameters);

    return {
      accessId
    };
  });
};

const updateResource = (candidate: AccessState, current: AccessState): Promise<AccessResult> => {
  const { result, parameters } = candidate;
  const { accessName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(AccessServiceName, accessName);
  }

  return Logger.logOperation(AccessServiceName, accessName, 'updates', async (logger) => {
    await checkGeneralUpdates(logger, result.accessId, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: AccessState) => {
  const { parameters, result } = current;

  if (!result) {
    return;
  }

  const accessName = parameters.accessName;

  await Logger.logOperation(AccessServiceName, accessName, 'deletion', async (logger) => {
    await deleteOriginAccess(logger, result.accessId);
  });
};

const checkGeneralUpdates = async (
  logger: Logger.OperationLogger,
  accessId: string,
  candidate: AccessParameters,
  current: AccessParameters
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateOriginAccess(logger, accessId, candidate);
  }
};
