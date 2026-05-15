import type { StepContext, StepHandler, StepOptions } from '@ez4/stateful';
import type { MigrationState, MigrationResult } from './types';

import { getTableRepositoryChanges } from '@ez4/pgmigration/library';
import { CorruptedResourceError, OperationLogger } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createTables, deleteTables, updateTables } from './client';
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
  return !!candidate.result && candidate.result.database === current.result?.database;
};

const previewResource = (candidate: MigrationState, current: MigrationState, options: StepOptions) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const sourceRepository = options.force ? {} : source.repository;
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
  const { database, envName, repository } = parameters;

  return OperationLogger.logExecution(MigrationServiceName, database, 'updates', async () => {
    if (!result) {
      throw new CorruptedResourceError(MigrationServiceName, database);
    }

    const sourceRepository = context.force ? {} : current.parameters.repository;
    const databaseChanges = getTableRepositoryChanges(repository, sourceRepository);

    if (!databaseChanges.counts) {
      return result;
    }

    await updateTables({ database, envName, repository }, sourceRepository);

    return result;
  });
};

const deleteResource = async (current: MigrationState, context: StepContext) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  const { database, envName, repository, allowDeletion } = parameters;

  await OperationLogger.logExecution(MigrationServiceName, database, 'deletion', async () => {
    if (!allowDeletion && !context.force) {
      throw new MigrationDeletionDeniedError(database);
    }

    await deleteTables({ database, envName, repository });
  });
};
