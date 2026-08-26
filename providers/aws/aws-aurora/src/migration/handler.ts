import type { StepContext, StepHandler } from '@ez4/state';
import type { MigrationState, MigrationResult } from './types';

import { CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { getCreateQueries, getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepositoryChanges } from '@ez4/pgmigration/library';
import { deepCompare } from '@ez4/utils';

import { getClusterResult } from '../cluster/utils';
import { createDatabase, deleteDatabase, modifyDatabase } from './client';
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

const previewResource = (candidate: MigrationState, current: MigrationState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const sourceRepository = (current.partial ? current.result?.oldRepository : undefined) ?? source.repository;
  const targetRepository = target.repository;

  const databaseChanges = getTableRepositoryChanges(targetRepository, sourceRepository);

  const resourceChanges = deepCompare(
    {
      ...target,
      rollout: true
    },
    {
      ...source,
      rollout: !current.partial
    },
    {
      exclude: {
        repository: true
      }
    }
  );

  return {
    ...resourceChanges,
    counts: resourceChanges.counts + (databaseChanges.counts && 1),
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
  const { parameters } = candidate;
  const { database, repository } = parameters;

  return OperationLogger.logExecution(MigrationServiceName, database, 'creation', async (logger) => {
    const { clusterArn, secretArn } = getClusterResult(MigrationServiceName, 'migration', context);

    const queries = getCreateQueries(repository);

    await createDatabase(logger, {
      database,
      clusterArn,
      secretArn
    });

    await modifyDatabase(logger, {
      database,
      clusterArn,
      secretArn,
      queries
    });

    return {
      clusterArn,
      secretArn
    };
  });
};

const updateResource = async (candidate: MigrationState, current: MigrationState, context: StepContext) => {
  const { result, parameters } = candidate;
  const { database, repository: targetRepository } = parameters;

  return OperationLogger.logExecution(MigrationServiceName, database, 'updates', async (logger) => {
    if (!result) {
      throw new CorruptedResourceError(MigrationServiceName, database);
    }

    const sourceRepository = (current.partial ? current.result?.oldRepository : undefined) ?? current.parameters.repository;
    const databaseChanges = getTableRepositoryChanges(targetRepository, sourceRepository);

    const connectionData = {
      clusterArn: result.clusterArn,
      secretArn: result.secretArn
    };

    const newResult: MigrationResult = {
      ...connectionData
    };

    if (databaseChanges.counts) {
      newResult.oldRepository = sourceRepository;

      const steps = getUpdateStepQueries(targetRepository, sourceRepository);

      await modifyDatabase(logger, {
        ...connectionData,
        queries: steps.create,
        database
      });

      context.postAction(() =>
        OperationLogger.logExecution(MigrationServiceName, database, 'rollout', async (logger) => {
          await modifyDatabase(logger, {
            ...connectionData,
            queries: steps.update,
            database
          });

          context.postAction(() =>
            OperationLogger.logExecution(MigrationServiceName, database, 'cleanup', async (logger) => {
              await modifyDatabase(logger, {
                ...connectionData,
                queries: steps.delete,
                database
              });

              delete newResult.oldRepository;
            })
          );
        })
      );
    }

    return newResult;
  });
};

const deleteResource = async (current: MigrationState, context: StepContext) => {
  const { result, parameters } = current;
  const { database, allowDeletion } = parameters;

  if (result) {
    return OperationLogger.logExecution(MigrationServiceName, database, 'deletion', async (logger) => {
      if (!allowDeletion && !context.force) {
        throw new MigrationDeletionDeniedError(database);
      }

      const { clusterArn, secretArn } = result;

      await deleteDatabase(logger, {
        clusterArn,
        secretArn,
        database
      });
    });
  }
};
