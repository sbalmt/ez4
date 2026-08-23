import type { OperationLogLine } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/state';
import type { OriginState, OriginResult, OriginParameters } from './types';

import { CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createOriginPolicy, updateOriginPolicy, deleteOriginPolicy, importOriginPolicy } from './client';
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
  const { policyName } = candidate.parameters;

  return OperationLogger.logExecution(OriginServiceName, policyName, 'creation', async (logger) => {
    const importedOriginPolicy = await importOriginPolicy(logger, policyName);

    if (importedOriginPolicy) {
      const { policyId } = importedOriginPolicy;

      await updateOriginPolicy(logger, policyId, candidate.parameters);

      return {
        policyId
      };
    }

    const { policyId } = await createOriginPolicy(logger, candidate.parameters);

    return {
      policyId
    };
  });
};

const updateResource = async (candidate: OriginState, current: OriginState) => {
  const { result, parameters } = candidate;
  const { policyName } = parameters;

  return OperationLogger.logExecution(OriginServiceName, policyName, 'updates', async (logger) => {
    if (!result) {
      throw new CorruptedResourceError(OriginServiceName, policyName);
    }

    await checkGeneralUpdates(logger, result.policyId, parameters, current.parameters);
  });
};

const deleteResource = async (current: OriginState) => {
  const { parameters, result } = current;
  const { policyName } = parameters;

  if (result) {
    return OperationLogger.logExecution(OriginServiceName, policyName, 'deletion', async (logger) => {
      await deleteOriginPolicy(logger, result.policyId);
    });
  }
};

const checkGeneralUpdates = async (logger: OperationLogLine, policyId: string, candidate: OriginParameters, current: OriginParameters) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateOriginPolicy(logger, policyId, candidate);
  }
};
