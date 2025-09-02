import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { InstanceState, InstanceResult, InstanceParameters } from './types';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createInstance, deleteInstance, importInstance, tagInstance, untagInstance } from './client';

import { getClusterName } from '../cluster/utils';
import { InstanceServiceName } from './types';

export const getInstanceHandler = (): StepHandler<InstanceState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: InstanceState, current: InstanceState) => {
  return !!candidate.result && candidate.result.instanceArn === current.result?.instanceArn;
};

const previewResource = async (candidate: InstanceState, current: InstanceState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.instanceName
  };
};

const replaceResource = async (candidate: InstanceState, current: InstanceState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(InstanceServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: InstanceState, context: StepContext): Promise<InstanceResult> => {
  const parameters = candidate.parameters;

  const clusterName = getClusterName(InstanceServiceName, parameters.instanceName, context);

  const response = (await importInstance(parameters.instanceName)) ?? (await createInstance({ ...parameters, clusterName }));

  return {
    instanceName: response.instanceName,
    instanceArn: response.instanceArn,
    clusterName
  };
};

const updateResource = async (candidate: InstanceState, current: InstanceState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  await checkTagUpdates(result.instanceArn, parameters, current.parameters);
};

const deleteResource = async (candidate: InstanceState) => {
  const { result } = candidate;

  if (!result) {
    return;
  }

  await deleteInstance(result.instanceName);
};

const checkTagUpdates = async (instanceArn: Arn, candidate: InstanceParameters, current: InstanceParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagInstance(instanceArn, tags),
    (tags) => untagInstance(instanceArn, tags)
  );
};
