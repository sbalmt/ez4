import type { StepContext, StepHandler } from '@ez4/stateful';
import type { InvalidationState, InvalidationResult } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

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
  const changes = deepCompare(candidate.parameters, current.parameters);

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
    distributionId
  };
};

const updateResource = async (
  candidate: InvalidationState,
  current: InvalidationState,
  context: StepContext
): Promise<InvalidationResult | void> => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const distributionId = getDistributionId(InvalidationServiceName, 'invalidation', context);

  if (parameters.contentVersion !== current.parameters.contentVersion) {
    await createInvalidation(distributionId, ['/*']);
  }

  return {
    distributionId
  };
};

const deleteResource = async () => {
  // Nothing to delete, invalidation isn't a persistent resource.
};
