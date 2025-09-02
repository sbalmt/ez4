import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { AttributeSchema, AttributeSchemaGroup } from '../types/schema';
import type { TableState, TableResult, TableParameters } from './types';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepEqual, deepCompare } from '@ez4/utils';

import {
  createTable,
  updateStreams,
  updateCapacity,
  updateDeletion,
  updateTimeToLive,
  deleteTable,
  importIndex,
  createIndex,
  deleteIndex,
  tagTable,
  untagTable
} from './client';

import { getSecondaryIndexName } from './helpers/indexes';
import { TableServiceName } from './types';

export const getTableHandler = (): StepHandler<TableState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: TableState, current: TableState) => {
  return !!candidate.result && candidate.result.tableArn === current.result?.tableArn;
};

const previewResource = async (candidate: TableState, current: TableState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.tableName
  };
};

const replaceResource = async (candidate: TableState, current: TableState) => {
  if (current.result) {
    throw new ReplaceResourceError(TableServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: TableState): Promise<TableResult> => {
  const parameters = candidate.parameters;

  const response = await createTable(parameters);

  if (parameters.ttlAttribute) {
    await updateTimeToLive(response.tableName, {
      attributeName: parameters.ttlAttribute,
      enabled: true
    });
  }

  return {
    tableName: response.tableName,
    streamArn: response.streamArn,
    tableArn: response.tableArn
  };
};

const updateResource = async (candidate: TableState, current: TableState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const newResult = await checkStreamsUpdates(result.tableName, parameters, current.parameters);

  await checkCapacityUpdates(result.tableName, parameters, current.parameters);
  await checkDeletionUpdates(result.tableName, parameters, current.parameters);
  await checkTimeToLiveUpdates(result.tableName, parameters, current.parameters);
  await checkIndexUpdates(result.tableName, parameters, current.parameters);
  await checkTagUpdates(result.tableArn, parameters, current.parameters);

  return {
    ...result,
    ...newResult
  };
};

const deleteResource = async (candidate: TableState, context: StepContext) => {
  const { result, parameters } = candidate;

  const allowDeletion = !!parameters.allowDeletion;

  if (!result || (!allowDeletion && !context.force)) {
    return;
  }

  if (!allowDeletion) {
    await updateDeletion(result.tableName, true);
  }

  await deleteTable(result.tableName);
};

const checkStreamsUpdates = async (tableName: string, candidate: TableParameters, current: TableParameters) => {
  const enableStreams = !!candidate.enableStreams;

  if (enableStreams !== !!current.enableStreams) {
    return updateStreams(tableName, enableStreams);
  }

  return undefined;
};

const checkCapacityUpdates = async (tableName: string, candidate: TableParameters, current: TableParameters) => {
  const hasChanges = !deepEqual(candidate.capacityUnits ?? {}, current.capacityUnits ?? {});

  if (hasChanges) {
    await updateCapacity(tableName, candidate.capacityUnits);
  }
};

const checkDeletionUpdates = async (tableName: string, candidate: TableParameters, current: TableParameters) => {
  const allowDeletion = !!candidate.allowDeletion;

  if (allowDeletion !== !!current.allowDeletion) {
    await updateDeletion(tableName, allowDeletion);
  }
};

const checkTimeToLiveUpdates = async (tableName: string, candidate: TableParameters, current: TableParameters) => {
  const newAttributeName = candidate.ttlAttribute;
  const oldAttributeName = current.ttlAttribute;

  if (newAttributeName !== oldAttributeName && (newAttributeName || oldAttributeName)) {
    await updateTimeToLive(tableName, {
      attributeName: newAttributeName ?? oldAttributeName!,
      enabled: !!newAttributeName
    });
  }
};

const getAttributeSchemaMap = (attributeSchemas: AttributeSchemaGroup[]): Record<string, AttributeSchema[]> => {
  return attributeSchemas.reduce((attributeSchemaMap, attributeSchema) => {
    const indexName = getSecondaryIndexName(attributeSchema);

    return {
      ...attributeSchemaMap,
      [indexName]: attributeSchema
    };
  }, {});
};

const checkIndexUpdates = async (tableName: string, candidate: TableParameters, current: TableParameters) => {
  const [, ...targetAttributeSchema] = candidate.attributeSchema;
  const [, ...sourceAttributeSchema] = current.attributeSchema;

  const targetAttributeSchemaMap = getAttributeSchemaMap(targetAttributeSchema);
  const sourceAttributeSchemaMap = getAttributeSchemaMap(sourceAttributeSchema);

  const attributeSchemaChanges = deepCompare(targetAttributeSchemaMap, sourceAttributeSchemaMap);

  if (attributeSchemaChanges.create) {
    for (const indexName in attributeSchemaChanges.create) {
      const exists = await importIndex(tableName, targetAttributeSchemaMap[indexName]);

      if (!exists) {
        await createIndex(tableName, targetAttributeSchemaMap[indexName]);
      }
    }
  }

  if (attributeSchemaChanges.update) {
    for (const indexName in attributeSchemaChanges.update) {
      await deleteIndex(tableName, sourceAttributeSchemaMap[indexName]);
      await createIndex(tableName, targetAttributeSchemaMap[indexName]);
    }
  }

  if (attributeSchemaChanges.remove) {
    for (const indexName in attributeSchemaChanges.remove) {
      await deleteIndex(tableName, sourceAttributeSchemaMap[indexName]);
    }
  }
};

const checkTagUpdates = async (tableArn: Arn, candidate: TableParameters, current: TableParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagTable(tableArn, tags),
    (tags) => untagTable(tableArn, tags)
  );
};
