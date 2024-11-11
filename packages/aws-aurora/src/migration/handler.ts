import type { ObjectComparison } from '@ez4/utils';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Repository } from '../types/repository.js';
import type { MigrationState, MigrationResult } from './types.js';
import type { DatabaseRequest, RepositoryUpdates } from './client.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getClusterResult } from '../cluster/utils.js';
import { MigrationServiceName } from './types.js';

import {
  createDatabase,
  deleteDatabase,
  createTables,
  updateTables,
  deleteTables
} from './client.js';

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

const previewResource = async (candidate: MigrationState, current: MigrationState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  return deepCompare(target, source);
};

const replaceResource = async (
  candidate: MigrationState,
  current: MigrationState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(MigrationServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: MigrationState,
  context: StepContext
): Promise<MigrationResult> => {
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

const updateResource = async (candidate: MigrationState, current: MigrationState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const target = parameters.repository;
  const source = current.parameters.repository;

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return;
  }

  const configuration = {
    database: parameters.database,
    clusterArn: result.clusterArn,
    secretArn: result.secretArn
  };

  if (changes.create) {
    await applyCreateTables(configuration, changes.create);
  }

  if (changes.nested) {
    await applyUpdateTables(configuration, changes.nested, target);
  }

  if (changes.remove) {
    await applyDeleteTables(configuration, changes.remove);
  }
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

const applyCreateTables = async (configuration: DatabaseRequest, repository: Repository) => {
  await createTables({
    ...configuration,
    repository
  });
};

const applyUpdateTables = async (
  configuration: DatabaseRequest,
  comparison: Record<string, ObjectComparison>,
  repository: Repository
) => {
  const updates: Record<string, RepositoryUpdates> = {};

  for (const table in comparison) {
    const { nested } = comparison[table];

    if (!nested) {
      continue;
    }

    const { schema, relations, indexes } = nested;

    const targetColumns = schema?.nested?.properties;
    const targetSchema = repository[table].schema.properties;
    const targetName = repository[table].name;

    const changes: RepositoryUpdates = {
      name: targetName,
      schema: {
        toCreate: {},
        toUpdate: {},
        toRemove: {}
      },
      relations: {
        toCreate: {},
        toRemove: {}
      },
      indexes: {
        toCreate: {},
        toRemove: {}
      }
    };

    if (targetColumns?.create) {
      changes.schema.toCreate = targetColumns.create;
    }

    for (const column in targetColumns?.nested) {
      changes.schema.toUpdate[column] = targetSchema[column];
    }

    if (targetColumns?.remove) {
      changes.schema.toRemove = targetColumns.remove;
    }

    if (relations?.create) {
      changes.relations.toCreate = relations.create;
    }

    if (relations?.remove) {
      changes.relations.toRemove = relations.remove;
    }

    if (indexes?.create) {
      changes.indexes.toCreate = indexes.create;
    }

    if (indexes?.remove) {
      changes.indexes.toRemove = indexes.remove;
    }

    updates[table] = changes;
  }

  await updateTables({
    repository: updates,
    ...configuration
  });
};

const applyDeleteTables = async (configuration: DatabaseRequest, repository: Repository) => {
  const tables = [];

  for (const alias in repository) {
    tables.push(repository[alias].name);
  }

  await deleteTables({
    ...configuration,
    tables
  });
};
