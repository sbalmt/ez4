import type { StepHandler } from '@ez4/stateful';
import type { AccessState, AccessResult, AccessParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createOriginAccess, updateAccess, deleteAccess } from './client.js';
import { AccessServiceName } from './types.js';

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

const previewResource = async (candidate: AccessState, current: AccessState) => {
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

const createResource = async (candidate: AccessState): Promise<AccessResult> => {
  const { accessId, version } = await createOriginAccess(candidate.parameters);

  return {
    accessId,
    version
  };
};

const updateResource = async (
  candidate: AccessState,
  current: AccessState
): Promise<AccessResult | void> => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { accessId, version } = await checkGeneralUpdates(result, parameters, current.parameters);

  return {
    accessId,
    version
  };
};

const deleteResource = async (candidate: AccessState) => {
  const result = candidate.result;

  if (result) {
    await deleteAccess(result.accessId, result.version);
  }
};

const checkGeneralUpdates = async (
  result: AccessResult,
  candidate: AccessParameters,
  current: AccessParameters
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    return updateAccess(result.accessId, result.version, candidate);
  }

  return result;
};