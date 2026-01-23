import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { PolicyDocument } from '../types/policy';
import type { PolicyState, PolicyResult, PolicyParameters } from './types';

import { applyTagUpdates, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createPolicyVersion, createPolicy, deletePolicy, deletePolicyVersion, tagPolicy, untagPolicy, importPolicy } from './client';
import { PolicyServiceName } from './types';

export const getPolicyHandler = (): StepHandler<PolicyState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: PolicyState, current: PolicyState) => {
  return !!candidate.result && candidate.result.policyArn === current.result?.policyArn;
};

const previewResource = (candidate: PolicyState, current: PolicyState) => {
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

const replaceResource = async (candidate: PolicyState, current: PolicyState) => {
  if (current.result) {
    throw new ReplaceResourceError(PolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = (candidate: PolicyState): Promise<PolicyResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(PolicyServiceName, parameters.policyName, 'creation', async (logger) => {
    const importedPolicy = await importPolicy(logger, parameters.policyName);

    if (importedPolicy) {
      const { policyArn, currentVersion, versionHistory } = importedPolicy;

      return {
        versionHistory,
        currentVersion,
        policyArn
      };
    }

    const response = await createPolicy(logger, parameters);

    return {
      versionHistory: [],
      currentVersion: response.currentVersion,
      policyArn: response.policyArn
    };
  });
};

const updateResource = (candidate: PolicyState, current: PolicyState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  return OperationLogger.logExecution(PolicyServiceName, parameters.policyName, 'updates', async (logger) => {
    await checkTagUpdates(logger, result.policyArn, candidate.parameters, current.parameters);

    const newResult = await checkDocumentUpdates(logger, result, candidate.parameters, current.parameters);

    return {
      ...result,
      ...newResult
    };
  });
};

const deleteResource = async (current: PolicyState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  await OperationLogger.logExecution(PolicyServiceName, parameters.policyName, 'deletion', async (logger) => {
    // Can only remove the policy after deleting all its versions.
    if (result.versionHistory.length) {
      await deleteVersions(logger, result.policyArn, result.versionHistory);
    }

    await deletePolicy(logger, result.policyArn);
  });
};

const checkDocumentUpdates = async (
  logger: OperationLogLine,
  result: PolicyResult,
  candidate: PolicyParameters,
  current: PolicyParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      policyName: true,
      tags: true
    }
  });

  if (hasChanges) {
    return createVersion(logger, result, candidate.policyDocument);
  }

  return result;
};

const checkTagUpdates = async (logger: OperationLogLine, policyArn: Arn, candidate: PolicyParameters, current: PolicyParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagPolicy(logger, policyArn, tags),
    (tags) => untagPolicy(logger, policyArn, tags)
  );
};

const createVersion = async (logger: OperationLogLine, result: PolicyResult, policyDocument: PolicyDocument) => {
  const { policyArn, currentVersion, versionHistory } = result;

  // A managed policy can have up to 5 versions (1 current + 4 history)
  // @see https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-versioning.html
  if (versionHistory.length === 4) {
    const oldestVersionId = versionHistory.shift();

    if (oldestVersionId) {
      await deletePolicyVersion(logger, policyArn, oldestVersionId);
    }
  }

  const response = await createPolicyVersion(logger, policyArn, policyDocument);

  return {
    ...result,
    currentVersion: response.versionId,
    versionHistory: [...versionHistory, currentVersion]
  };
};

const deleteVersions = async (logger: OperationLogLine, policyArn: Arn, versionHistory: string[]) => {
  const operations = versionHistory.map((versionId) => {
    return deletePolicyVersion(logger, policyArn, versionId);
  });

  await Promise.all(operations);
};
