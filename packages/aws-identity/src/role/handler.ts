import type { Arn } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { PolicyState } from '../policy/types.js';
import type { RoleState, RoleResult, RoleParameters } from './types.js';

import { applyTagUpdates, IncompleteResourceError, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  attachPolicy,
  createRole,
  deleteRole,
  detachPolicy,
  tagRole,
  untagRole,
  updateAssumeRole,
  updateRole
} from './client.js';

import { PolicyServiceType } from '../policy/types.js';
import { RoleServiceName } from './types.js';

export const getRoleHandler = (): StepHandler<RoleState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: RoleState, current: RoleState) => {
  return !!candidate.result && candidate.result.roleArn === current.result?.roleArn;
};

const previewResource = async (candidate: RoleState, current: RoleState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.roleName
  };
};

const replaceResource = async (candidate: RoleState, current: RoleState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(RoleServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: RoleState, context: StepContext): Promise<RoleResult> => {
  const response = await createRole(candidate.parameters);

  const policies = context.getDependencies<PolicyState>(PolicyServiceType);
  const policyArns = getPolicyArns(response.roleName, policies);

  if (policyArns.length) {
    await attachPolicies(response.roleName, policyArns);
  }

  return {
    roleName: response.roleName,
    roleArn: response.roleArn,
    policyArns
  };
};

const updateResource = async (candidate: RoleState, current: RoleState, context: StepContext) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const policies = context.getDependencies<PolicyState>(PolicyServiceType);
  const policyArns = getPolicyArns(result.roleName, policies);

  await Promise.all([
    checkGeneralUpdates(result.roleName, candidate.parameters, current.parameters),
    checkDocumentUpdates(result.roleName, candidate.parameters, current.parameters),
    checkPolicyUpdates(result.roleName, policyArns, result.policyArns),
    checkTagUpdates(result.roleName, candidate.parameters, current.parameters)
  ]);

  return {
    ...result,
    policyArns
  };
};

const deleteResource = async (candidate: RoleState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  // Can only remove role after detaching all its policies.
  if (result.policyArns.length) {
    await detachPolicies(result.roleName, result.policyArns);
  }

  await deleteRole(result.roleName);
};

const getPolicyArns = (roleName: string, policyStates: PolicyState[]) => {
  return policyStates.map(({ parameters, result }) => {
    if (!result) {
      throw new IncompleteResourceError(RoleServiceName, roleName, parameters.policyName);
    }

    return result.policyArn;
  });
};

const checkGeneralUpdates = async (
  roleName: string,
  candidate: RoleParameters,
  current: RoleParameters
) => {
  if (candidate.description !== current.description) {
    await updateRole(roleName, candidate.description);
  }
};

const checkDocumentUpdates = async (
  roleName: string,
  candidate: RoleParameters,
  current: RoleParameters
) => {
  const hasChanges = !deepEqual(candidate.roleDocument, current.roleDocument);

  if (hasChanges) {
    await updateAssumeRole(roleName, candidate.roleDocument);
  }
};

const checkPolicyUpdates = async (roleName: string, newPolicyArns: Arn[], oldPolicyArns: Arn[]) => {
  const newPolicyArnSet = new Set(newPolicyArns);
  const oldPolicyArnSet = new Set(oldPolicyArns);

  const policiesToAttach = newPolicyArns.filter((policyArn) => !oldPolicyArnSet.has(policyArn));
  const policiesToDetach = oldPolicyArns.filter((policyArn) => !newPolicyArnSet.has(policyArn));

  await Promise.all([
    attachPolicies(roleName, policiesToAttach),
    detachPolicies(roleName, policiesToDetach)
  ]);

  return newPolicyArns;
};

const checkTagUpdates = async (
  roleName: string,
  candidate: RoleParameters,
  current: RoleParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagRole(roleName, tags),
    (tags) => untagRole(roleName, tags)
  );
};

const attachPolicies = async (roleName: string, policyArns: Arn[]) => {
  const operations = policyArns.map(async (policyArn) => {
    await attachPolicy(roleName, policyArn);

    return policyArn;
  });

  return await Promise.all(operations);
};

const detachPolicies = async (roleName: string, policyArns: Arn[]) => {
  const operations = policyArns.map(async (policyArn) => {
    await detachPolicy(roleName, policyArn);

    return policyArn;
  });

  return await Promise.all(operations);
};
