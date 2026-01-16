import type { StepContext, StepHandler, StepOptions } from '@ez4/stateful';
import type { MigrationState, MigrationResult } from './types';

import { getTableRepositoryChanges } from '@ez4/pgmigration/library';
import { Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getClusterResult } from '../cluster/utils';
import { createDatabase, deleteDatabase, createTables, updateTables } from './client';
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

  const databaseChanges = getTableRepositoryChanges(target.repository, options.force ? {} : source.repository);

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

  return Logger.logOperation(MigrationServiceName, database, 'creation', async (logger) => {
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

const updateResource = (candidate: MigrationState, current: MigrationState, context: StepContext) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const targetRepository = parameters.repository;
  const sourceRepository = context.force ? {} : current.parameters.repository;

  const databaseChanges = getTableRepositoryChanges(targetRepository, sourceRepository);

  if (!databaseChanges.counts) {
    return;
  }

  const { database } = parameters;

  return Logger.logOperation(MigrationServiceName, database, 'updates', async (logger) => {
    await updateTables(logger, {
      database: parameters.database,
      clusterArn: result.clusterArn,
      secretArn: result.secretArn,
      repository: {
        target: targetRepository,
        source: sourceRepository
      }
    });
  });
};

const deleteResource = async (current: MigrationState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  const { database } = parameters;

  await Logger.logOperation(MigrationServiceName, database, 'deletion', async (logger) => {
    const { clusterArn, secretArn } = result;

    await deleteDatabase(logger, {
      database: parameters.database,
      clusterArn,
      secretArn
    });
  });
};
