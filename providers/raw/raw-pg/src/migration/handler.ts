import type { StepContext, StepHandler, StepOptions } from '@ez4/state';
import type { MigrationState, MigrationResult } from './types';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepositoryChanges } from '@ez4/pgmigration/library';
import { CorruptedResourceError, OperationLogger } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createTables, deleteTables, updateTables, validateTables } from './client';
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
  return !!candidate.result && candidate.result.database === current.result?.database;
};

const previewResource = (candidate: MigrationState, current: MigrationState, options: StepOptions) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const sourceRepository = options.force ? {} : ((current.partial ? current.result?.oldRepository : undefined) ?? source.repository);
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

const replaceResource = async (candidate: MigrationState, _current: MigrationState, context: StepContext) => {
  return createResource(candidate, context);
};

const createResource = (candidate: MigrationState, _context: StepContext): Promise<MigrationResult> => {
  const { parameters } = candidate;
  const { database, envName, repository } = parameters;

  return OperationLogger.logExecution(MigrationServiceName, database, 'creation', async () => {
    await createTables({ database, envName, repository });

    return { database };
  });
};

const updateResource = (candidate: MigrationState, current: MigrationState, context: StepContext): Promise<MigrationResult> => {
  const { result, parameters } = candidate;
  const { database, envName, repository: targetRepository } = parameters;

  return OperationLogger.logExecution(MigrationServiceName, database, 'updates', async () => {
    if (!result) {
      throw new CorruptedResourceError(MigrationServiceName, database);
    }

    const sourceRepository = (current.partial ? current.result?.oldRepository : undefined) ?? current.parameters.repository;
    const databaseChanges = getTableRepositoryChanges(targetRepository, sourceRepository);

    const newResult: MigrationResult = { database };

    if (databaseChanges.counts) {
      newResult.oldRepository = sourceRepository;

      const steps = getUpdateStepQueries(targetRepository, sourceRepository);

      const connectionData = {
        repository: targetRepository,
        database,
        envName
      };

      await updateTables(connectionData, steps.prepare);

      context.postAction(() =>
        OperationLogger.logExecution(MigrationServiceName, database, 'rollout', async () => {
          await updateTables(connectionData, steps.rollout);
          await validateTables(connectionData, [...steps.prepare.validations, ...steps.rollout.validations]);

          context.postAction(() =>
            OperationLogger.logExecution(MigrationServiceName, database, 'cleanup', async () => {
              await updateTables(connectionData, steps.cleanup);
              await validateTables(connectionData, steps.cleanup.validations);

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

  if (result) {
    const { database, envName, repository, allowDeletion } = parameters;

    return OperationLogger.logExecution(MigrationServiceName, database, 'deletion', async () => {
      if (!allowDeletion && !context.force) {
        context.addWarning(`Deletion of database '${database}' is denied.`);
        return;
      }

      await deleteTables({
        repository,
        database,
        envName
      });
    });
  }
};
