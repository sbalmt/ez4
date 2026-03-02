import type { StepContext, StepHandler, StepOptions } from '@ez4/stateful';
import type { IntegrityState, IntegrityResult } from './types';

import { CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, hashObject } from '@ez4/utils';

import { getMigrationResult } from '../migration/utils';
import { IntegrityServiceName } from './types';
import { validateChanges } from './client';

export const getIntegrityHandler = (): StepHandler<IntegrityState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: IntegrityState, current: IntegrityState) => {
  return !!candidate.result && candidate.parameters.getDatabase() === current.result?.database;
};

const previewResource = (candidate: IntegrityState, current: IntegrityState, _options: StepOptions) => {
  const target = candidate.parameters;
  const source = current.parameters;

  const resourceChanges = deepCompare(
    {
      ...target,
      dependencies: candidate.dependencies,
      integrityHash: hashObject(target.getRepository())
    },
    {
      ...source,
      dependencies: current.dependencies,
      integrityHash: current.result?.integrityHash
    }
  );

  return {
    ...resourceChanges,
    counts: resourceChanges.counts,
    name: target.getDatabase()
  };
};

const replaceResource = async (candidate: IntegrityState, current: IntegrityState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(IntegrityServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: IntegrityState, context: StepContext): Promise<IntegrityResult> => {
  const { parameters } = candidate;

  const database = parameters.getDatabase();

  return OperationLogger.logExecution(IntegrityServiceName, database, 'creation', async (logger) => {
    const { clusterArn, secretArn } = getMigrationResult(IntegrityServiceName, 'integrity', context);

    const targetRepository = parameters.getRepository();

    const request = {
      database,
      clusterArn,
      secretArn,
      repository: {
        target: targetRepository,
        source: {}
      }
    };

    await validateChanges(logger, request);

    return {
      integrityHash: hashObject(targetRepository),
      database
    };
  });
};

const updateResource = (candidate: IntegrityState, current: IntegrityState, context: StepContext): Promise<IntegrityResult> => {
  const { result, parameters } = candidate;

  const database = parameters.getDatabase();

  if (!result) {
    throw new CorruptedResourceError(IntegrityServiceName, database);
  }

  return OperationLogger.logExecution(IntegrityServiceName, database, 'updates', async (logger) => {
    const { clusterArn, secretArn } = getMigrationResult(IntegrityServiceName, 'integrity', context);

    const targetRepository = parameters.getRepository();

    const newIntegrityHash = hashObject(targetRepository);
    const oldIntegrityHash = current.result?.integrityHash;

    if (newIntegrityHash === oldIntegrityHash) {
      return result;
    }

    await validateChanges(logger, {
      database,
      clusterArn,
      secretArn,
      repository: {
        target: parameters.getRepository(),
        source: {}
      }
    });

    return {
      ...result,
      integrityHash: newIntegrityHash
    };
  });
};

const deleteResource = async () => {};
