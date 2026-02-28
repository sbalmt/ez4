import type { StepContext, StepHandler, StepOptions } from '@ez4/stateful';
import type { MigrationState, MigrationResult } from './types';

import { getTableRepositoryChanges } from '@ez4/pgmigration/library';
import { CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getClusterResult } from '../cluster/utils';
import { getRepositoryStub } from '../utils/database';
import { createDatabase, deleteDatabase, createTables, updateTables } from './client';
import { MigrationDeletionDeniedError } from './errors';
import { MigrationServiceName } from './types';

export const getMigrationHandler = (): StepHandler<MigrationState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: MigrationState, current: MigrationState) => {
  return !!candidate.result && candidate.result.clusterArn === current.result?.clusterArn;
};

const previewResource = (candidate: MigrationState, current: MigrationState, options: StepOptions) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const sourceRepository = options.force ? getRepositoryStub(source.repository) : source.repository;
  const targetRepository = target.repository;

  const databaseChanges = getTableRepositoryChanges(targetRepository, sourceRepository);

  const resourceChanges = deepCompare(target, source, {
    exclude: {
      repository: true
    }
  });

  return {
    ...resourceChanges,
    counts: resourceChanges.counts + Math.max(databaseChanges.counts, 1),
    name: target.database,
    nested: {
      ...resourceChanges.nested,
      repository: databaseChanges
    }
  };
};

const replaceResource = async (candidate: MigrationState, current: MigrationState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(MigrationServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: MigrationState, context: StepContext): Promise<MigrationResult> => {
  const parameters = candidate.parameters;

  const { database } = parameters;

  return OperationLogger.logExecution(MigrationServiceName, database, 'creation', async (logger) => {
    const { clusterArn, secretArn } = getClusterResult(MigrationServiceName, 'migration', context);

    const request = {
      ...parameters,
      clusterArn,
      secretArn
    };

    await createDatabase(logger, request);
    await createTables(logger, request);

    return {
      clusterArn,
      secretArn
    };
  });
};

const updateResource = (candidate: MigrationState, current: MigrationState, context: StepContext): Promise<MigrationResult> => {
  const { result, parameters } = candidate;
  const { database } = parameters;

  if (!result) {
    throw new CorruptedResourceError(MigrationServiceName, database);
  }

  const sourceRepository = context.force ? getRepositoryStub(current.parameters.repository) : current.parameters.repository;
  const targetRepository = parameters.repository;

  const databaseChanges = getTableRepositoryChanges(targetRepository, sourceRepository);

  if (!databaseChanges.counts) {
    return Promise.resolve(result);
  }

  return OperationLogger.logExecution(MigrationServiceName, database, 'updates', async (logger) => {
    await updateTables(logger, {
      database: parameters.database,
      clusterArn: result.clusterArn,
      secretArn: result.secretArn,
      repository: {
        target: targetRepository,
        source: sourceRepository
      }
    });

    return result;
  });
};

const deleteResource = async (current: MigrationState, context: StepContext) => {
  const { result, parameters } = current;

  if (result) {
    const { database, allowDeletion } = parameters;

    await OperationLogger.logExecution(MigrationServiceName, database, 'deletion', async (logger) => {
      if (!allowDeletion && !context.force) {
        throw new MigrationDeletionDeniedError(database);
      }

      const { clusterArn, secretArn } = result;

      await deleteDatabase(logger, {
        database: parameters.database,
        clusterArn,
        secretArn
      });
    });
  }
};
