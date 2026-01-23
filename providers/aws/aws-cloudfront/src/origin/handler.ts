import type { StepHandler } from '@ez4/stateful';
import type { OperationLogLine } from '@ez4/aws-common';
import type { OriginState, OriginResult, OriginParameters } from './types';

import { OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createOriginPolicy, updateOriginPolicy, deleteOriginPolicy } from './client';
import { OriginServiceName } from './types';

export const getPolicyHandler = (): StepHandler<OriginState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: OriginState, current: OriginState) => {
  return !!candidate.result && candidate.result.policyId === current.result?.policyId;
};

const previewResource = (candidate: OriginState, current: OriginState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.policyName
  };
};

const replaceResource = async (candidate: OriginState, current: OriginState) => {
  if (current.result) {
    throw new ReplaceResourceError(OriginServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = (candidate: OriginState): Promise<OriginResult> => {
  const { parameters } = candidate;

  const policyName = parameters.policyName;

  return OperationLogger.logExecution(OriginServiceName, policyName, 'creation', async (logger) => {
    const { policyId } = await createOriginPolicy(logger, parameters);

    return {
      policyId
    };
  });
};

const updateResource = (candidate: OriginState, current: OriginState): Promise<OriginResult | undefined> => {
  const { result, parameters } = candidate;

  if (!result) {
    return Promise.resolve(undefined);
  }

  const policyName = parameters.policyName;

  return OperationLogger.logExecution(OriginServiceName, policyName, 'updates', async (logger) => {
    await checkGeneralUpdates(logger, result.policyId, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: OriginState) => {
  const { parameters, result } = current;

  if (!result) {
    return;
  }

  const policyName = parameters.policyName;

  await OperationLogger.logExecution(OriginServiceName, policyName, 'deletion', async (logger) => {
    await deleteOriginPolicy(logger, result.policyId);
  });
};

const checkGeneralUpdates = async (logger: OperationLogLine, policyId: string, candidate: OriginParameters, current: OriginParameters) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateOriginPolicy(logger, policyId, candidate);
  }
};
