import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { PolicyDocument } from '../types/policy.js';
import type { PolicyState, PolicyResult, PolicyParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  createPolicyVersion,
  createPolicy,
  deletePolicy,
  deletePolicyVersion,
  tagPolicy,
  untagPolicy
} from './client.js';

import { PolicyServiceName } from './types.js';

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
  const parameters = candidate.parameters;
  const changes = deepCompare(parameters, current.parameters);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: parameters.policyName
  };
};

const replaceResource = async (candidate: PolicyState, current: PolicyState) => {
  if (current.result) {
    throw new ReplaceResourceError(PolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: PolicyState): Promise<PolicyResult> => {
  const response = await createPolicy(candidate.parameters);

  return {
    policyArn: response.policyArn,
    currentVersion: response.currentVersion,
    versionHistory: []
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

const checkDocumentUpdates = async (
  result: PolicyResult,
  candidate: PolicyParameters,
  current: PolicyParameters
) => {
  if (!deepEqual(candidate, current, { policyName: true, tags: true })) {
    return await createVersion(result, candidate.policyDocument);
  }

  return result;
};

const checkTagUpdates = async (
  policyArn: Arn,
  candidate: PolicyParameters,
  current: PolicyParameters
) => {
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
