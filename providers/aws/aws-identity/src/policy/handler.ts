import type { StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { PolicyDocument } from '../types/policy';
import type { PolicyState, PolicyResult, PolicyParameters } from './types';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
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

const previewResource = async (candidate: PolicyState, current: PolicyState) => {
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

const createResource = async (candidate: PolicyState): Promise<PolicyResult> => {
  const parameters = candidate.parameters;

  const importedPolicy = await importPolicy(parameters.policyName);

  if (importedPolicy) {
    const { policyArn, currentVersion, versionHistory } = importedPolicy;

    return {
      versionHistory,
      currentVersion,
      policyArn
    };
  }

  const response = await createPolicy(parameters);

  return {
    versionHistory: [],
    currentVersion: response.currentVersion,
    policyArn: response.policyArn
  };
};

const updateResource = async (candidate: PolicyState, current: PolicyState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const [newResult] = await Promise.all([
    checkDocumentUpdates(result, candidate.parameters, current.parameters),
    checkTagUpdates(result.policyArn, candidate.parameters, current.parameters)
  ]);

  return newResult;
};

const deleteResource = async (candidate: PolicyState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  // Can only remove the policy after deleting all its versions.
  if (result.versionHistory.length) {
    await deleteVersions(result.policyArn, result.versionHistory);
  }

  await deletePolicy(result.policyArn);
};

const checkDocumentUpdates = async (result: PolicyResult, candidate: PolicyParameters, current: PolicyParameters) => {
  const hasChanges = !deepEqual(candidate, current, {
    exclude: {
      policyName: true,
      tags: true
    }
  });

  if (hasChanges) {
    return createVersion(result, candidate.policyDocument);
  }

  return result;
};

const checkTagUpdates = async (policyArn: Arn, candidate: PolicyParameters, current: PolicyParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagPolicy(policyArn, tags),
    (tags) => untagPolicy(policyArn, tags)
  );
};

const createVersion = async (result: PolicyResult, policyDocument: PolicyDocument) => {
  const { policyArn, currentVersion, versionHistory } = result;

  // A managed policy can have up to 5 versions (1 current + 4 history)
  // @see https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-versioning.html
  if (versionHistory.length === 4) {
    const oldestVersionId = versionHistory.shift();

    if (oldestVersionId) {
      await deletePolicyVersion(policyArn, oldestVersionId);
    }
  }

  const response = await createPolicyVersion(policyArn, policyDocument);

  return {
    ...result,
    currentVersion: response.versionId,
    versionHistory: [...versionHistory, currentVersion]
  };
};

const deleteVersions = async (policyArn: Arn, versionHistory: string[]) => {
  const operations = versionHistory.map((versionId) => {
    return deletePolicyVersion(policyArn, versionId);
  });

  await Promise.all(operations);
};
