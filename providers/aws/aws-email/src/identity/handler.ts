import type { StepContext, StepHandler } from '@ez4/stateful';
import type { OperationLogLine } from '@ez4/aws-common';
import type { IdentityState, IdentityResult, IdentityParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { importIdentity, createIdentity, deleteIdentity, tagIdentity, untagIdentity } from './client';
import { IdentityServiceName } from './types';

export const getIdentityHandler = (): StepHandler<IdentityState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: IdentityState, current: IdentityState) => {
  return !!candidate.result && candidate.result.identityArn === current.result?.identityArn;
};

const previewResource = (candidate: IdentityState, current: IdentityState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.identity
  };
};

const replaceResource = async (candidate: IdentityState, current: IdentityState) => {
  if (current.result) {
    throw new ReplaceResourceError(IdentityServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = (candidate: IdentityState): Promise<IdentityResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(IdentityServiceName, parameters.identity, 'creation', async (logger) => {
    const { identityArn } = (await importIdentity(logger, parameters.identity)) ?? (await createIdentity(logger, parameters));

    return {
      identityArn
    };
  });
};

const updateResource = (candidate: IdentityState, current: IdentityState): Promise<IdentityResult> => {
  const { result, parameters } = candidate;
  const { identity } = parameters;

  if (!result) {
    throw new CorruptedResourceError(IdentityServiceName, identity);
  }

  return OperationLogger.logExecution(IdentityServiceName, identity, 'updates', async (logger) => {
    await checkTagUpdates(logger, result.identityArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = (current: IdentityState, context: StepContext) => {
  const { result, parameters } = current;

  if (!result || !context.force) {
    return;
  }

  return OperationLogger.logExecution(IdentityServiceName, parameters.identity, 'deletion', async (logger) => {
    await deleteIdentity(logger, parameters.identity);
  });
};

const checkTagUpdates = async (
  logger: OperationLogLine,
  IdentityUrl: string,
  candidate: IdentityParameters,
  current: IdentityParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagIdentity(logger, IdentityUrl, tags),
    (tags) => untagIdentity(logger, IdentityUrl, tags)
  );
};
