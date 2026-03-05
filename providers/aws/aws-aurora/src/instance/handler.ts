import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { InstanceState, InstanceResult, InstanceParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, ReplaceResourceError } from '@ez4/aws-common';
import { OperationLogger } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createInstance, deleteInstance, importInstance, tagInstance, untagInstance } from './client';

import { getClusterName } from '../cluster/utils';
import { InstanceServiceName } from './types';
import { InstanceDeletionDeniedError } from './errors';

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

const previewResource = (candidate: InstanceState, current: InstanceState) => {
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

const createResource = (candidate: InstanceState, context: StepContext): Promise<InstanceResult> => {
  const parameters = candidate.parameters;

  const clusterName = getClusterName(InstanceServiceName, parameters.instanceName, context);

  return OperationLogger.logExecution(InstanceServiceName, parameters.instanceName, 'creation', async (logger) => {
    const response =
      (await importInstance(logger, parameters.instanceName)) ??
      (await createInstance(logger, {
        ...parameters,
        clusterName
      }));

    return {
      instanceName: response.instanceName,
      instanceArn: response.instanceArn,
      clusterName
    };
  });
};

const updateResource = (candidate: InstanceState, current: InstanceState): Promise<InstanceResult> => {
  const { result, parameters } = candidate;
  const { instanceName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(InstanceServiceName, instanceName);
  }

  return OperationLogger.logExecution(InstanceServiceName, instanceName, 'updates', async (logger) => {
    await checkTagUpdates(logger, result.instanceArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: InstanceState, context: StepContext) => {
  const { result, parameters } = current;

  if (result) {
    const { instanceName } = result;

    await OperationLogger.logExecution(InstanceServiceName, instanceName, 'deletion', async (logger) => {
      const { allowDeletion } = parameters;

      if (!allowDeletion && !context.force) {
        throw new InstanceDeletionDeniedError(instanceName);
      }

      await deleteInstance(logger, instanceName);
    });
  }
};

const checkTagUpdates = async (logger: OperationLogLine, instanceArn: Arn, candidate: InstanceParameters, current: InstanceParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagInstance(logger, instanceArn, tags),
    (tags) => untagInstance(logger, instanceArn, tags)
  );
};
