import type { StepHandler } from '@ez4/stateful';
import type { RuleState, RuleResult, RuleParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createRule, deleteRule, tagRule, untagRule, updateRule } from './client.js';
import { RuleServiceName } from './types.js';

export const getRuleHandler = (): StepHandler<RuleState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: RuleState, current: RuleState) => {
  return !!candidate.result && candidate.result.ruleArn === current.result?.ruleArn;
};

const previewResource = async (candidate: RuleState, current: RuleState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.ruleName
  };
};

const replaceResource = async (candidate: RuleState, current: RuleState) => {
  if (current.result) {
    throw new ReplaceResourceError(RuleServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: RuleState): Promise<RuleResult> => {
  const response = await createRule(candidate.parameters);

  return {
    ruleArn: response.ruleArn
  };
};

const updateResource = async (candidate: RuleState, current: RuleState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  await Promise.all([
    checkGeneralUpdates(parameters.ruleName, parameters, current.parameters),
    checkTagUpdates(result.ruleArn, parameters, current.parameters)
  ]);
};

const deleteResource = async (candidate: RuleState) => {
  const { result, parameters } = candidate;

  if (result) {
    await deleteRule(parameters.ruleName);
  }
};

const checkGeneralUpdates = async (
  ruleName: string,
  candidate: RuleParameters,
  current: RuleParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    ruleName: true,
    tags: true
  });

  if (hasChanges) {
    await updateRule(ruleName, candidate);
  }
};

const checkTagUpdates = async (
  ruleArn: string,
  candidate: RuleParameters,
  current: RuleParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagRule(ruleArn, tags),
    (tags) => untagRule(ruleArn, tags)
  );
};
