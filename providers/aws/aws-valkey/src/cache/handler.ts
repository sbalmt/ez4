import type { StepContext, StepHandler } from '@ez4/stateful';
import type { OperationLogLine } from '@ez4/aws-common';
import type { CacheState, CacheResult, CacheParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { importCache, createCache, deleteCache, tagCache, untagCache } from './client';
import { CacheServiceName } from './types';

export const getCacheHandler = (): StepHandler<CacheState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: CacheState, current: CacheState) => {
  return !!candidate.result && candidate.result.cacheArn === current.result?.cacheArn;
};

const previewResource = (candidate: CacheState, current: CacheState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.name
  };
};

const replaceResource = async (candidate: CacheState, current: CacheState) => {
  if (current.result) {
    throw new ReplaceResourceError(CacheServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = (candidate: CacheState): Promise<CacheResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(CacheServiceName, parameters.name, 'creation', async (logger) => {
    const { cacheArn, readerEndpoint, writerEndpoint } =
      (await importCache(logger, parameters.name)) ?? (await createCache(logger, parameters));

    return {
      cacheArn,
      readerEndpoint,
      writerEndpoint
    };
  });
};

const updateResource = (candidate: CacheState, current: CacheState): Promise<CacheResult> => {
  const { result, parameters } = candidate;
  const { name } = parameters;

  if (!result) {
    throw new CorruptedResourceError(CacheServiceName, name);
  }

  return OperationLogger.logExecution(CacheServiceName, name, 'updates', async (logger) => {
    await checkTagUpdates(logger, result.cacheArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = (current: CacheState, context: StepContext) => {
  const { result, parameters } = current;

  const allowDeletion = !!parameters.allowDeletion;

  if (!result || (!allowDeletion && !context.force)) {
    return;
  }

  const { name } = parameters;

  return OperationLogger.logExecution(CacheServiceName, name, 'deletion', async (logger) => {
    await deleteCache(logger, name);
  });
};

const checkTagUpdates = async (logger: OperationLogLine, cacheArn: string, candidate: CacheParameters, current: CacheParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagCache(logger, cacheArn, tags),
    (tags) => untagCache(logger, cacheArn, tags)
  );
};
