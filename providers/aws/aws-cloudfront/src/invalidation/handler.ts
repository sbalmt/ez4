import type { StepContext, StepHandler } from '@ez4/stateful';
import type { InvalidationState, InvalidationResult } from './types';

import { Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getDistributionId } from '../distribution/utils';
import { InvalidationServiceName } from './types';
import { createInvalidation } from './client';

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

const previewResource = (candidate: InvalidationState, current: InvalidationState) => {
  const changes = deepCompare(candidate.parameters, current.parameters);

  if (!changes.counts) {
    return undefined;
  }

  return changes;
};

const replaceResource = (candidate: InvalidationState, current: InvalidationState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(InvalidationServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (_candidate: InvalidationState, context: StepContext): InvalidationResult => {
  const distributionId = getDistributionId(InvalidationServiceName, 'invalidation', context);

  return {
    distributionId
  };
};

const updateResource = (
  candidate: InvalidationState,
  current: InvalidationState,
  context: StepContext
): Promise<InvalidationResult | void> => {
  const { result, parameters } = candidate;

  if (!result) {
    return Promise.resolve(undefined);
  }

  const distributionId = getDistributionId(InvalidationServiceName, 'invalidation', context);

  return Logger.logOperation(InvalidationServiceName, distributionId, 'invalidation', async (logger) => {
    if (parameters.contentVersion !== current.parameters.contentVersion) {
      await createInvalidation(logger, distributionId, ['/*']);
    }

    return {
      distributionId
    };
  });
};

const deleteResource = async () => {
  // Nothing to delete, invalidation isn't a persistent resource.
};
