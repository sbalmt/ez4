import type { StepContext, StepHandler, StepOptions } from '@ez4/stateful';
import type { MigrationState, MigrationResult } from './types.js';

import { getTableRepositoryChanges } from '@ez4/pgmigration/library';
import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getClusterResult } from '../cluster/utils.js';
import { createDatabase, deleteDatabase, createTables, updateTables } from './client.js';
import { MigrationServiceName } from './types.js';

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

const previewResource = async (candidate: MigrationState, current: MigrationState, options: StepOptions) => {
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

const createResource = async (candidate: MigrationState, context: StepContext): Promise<MigrationResult> => {
  const parameters = candidate.parameters;

  const { clusterArn, secretArn } = getClusterResult(MigrationServiceName, 'migration', context);

  const request = {
    ...parameters,
    clusterArn,
    secretArn
  };

  await createDatabase(request);
  await createTables(request);

  return {
    clusterArn,
    secretArn
  };
};

const updateResource = async (candidate: MigrationState, current: MigrationState, context: StepContext) => {
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

  updateTables({
    database: parameters.database,
    clusterArn: result.clusterArn,
    secretArn: result.secretArn,
    repository: {
      target: targetRepository,
      source: sourceRepository
    }
  });
};

const deleteResource = async (candidate: MigrationState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { clusterArn, secretArn } = result;

  await deleteDatabase({
    database: parameters.database,
    clusterArn,
    secretArn
  });
};
