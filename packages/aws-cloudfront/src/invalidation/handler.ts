import type { StepContext, StepHandler } from '@ez4/stateful';
import type { InvalidationState, InvalidationResult } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqualArray } from '@ez4/utils';
import { getObjectFiles } from '@ez4/aws-bucket';

import { getDistributionId } from '../distribution/utils.js';
import { InvalidationServiceName } from './types.js';
import { createInvalidation } from './client.js';

export const getInvalidationHandler = (): StepHandler<InvalidationState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: InvalidationState, current: InvalidationState) => {
  return !!candidate.result && candidate.result.distributionId === current.result?.distributionId;
};

const previewResource = async (candidate: InvalidationState, current: InvalidationState) => {
  const target = candidate.parameters;
  const source = current.parameters;

  const changes = deepCompare(
    {
      ...target,
      dependencies: candidate.dependencies,
      lastModified: Date.now()
    },
    {
      ...source,
      dependencies: current.dependencies,
      lastModified: current.result?.lastModified
    }
  );

  if (!changes.counts) {
    return undefined;
  }

  return changes;
};

const replaceResource = async (
  candidate: InvalidationState,
  current: InvalidationState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(InvalidationServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  _candidate: InvalidationState,
  context: StepContext
): Promise<InvalidationResult> => {
  const distributionId = getDistributionId(InvalidationServiceName, 'invalidation', context);

  return {
    distributionId,
    lastModified: Date.now(),
    lastChanges: getObjectFiles(context)
  };
};

const updateResource = async (
  candidate: InvalidationState,
  current: InvalidationState,
  context: StepContext
): Promise<InvalidationResult | void> => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const distributionId = getDistributionId(InvalidationServiceName, 'invalidation', context);

  const newObjectFiles = getObjectFiles(context);
  const oldObjectFiles = current.result?.lastChanges ?? newObjectFiles;

  const hasChanges = !deepEqualArray(newObjectFiles, oldObjectFiles);

  if (!hasChanges) {
    return;
  }

  await createInvalidation(distributionId, candidate.parameters.files);

  return {
    distributionId,
    lastModified: Date.now(),
    lastChanges: newObjectFiles
  };
};

const deleteResource = async () => {
  // Nothing to delete, invalidation isn't a persistent resource.
};
