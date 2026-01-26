import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { AttributeSchema, AttributeSchemaGroup } from '../types/schema';
import type { TableState, TableResult, TableParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
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

const previewResource = (candidate: TableState, current: TableState) => {
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

const createResource = (candidate: TableState): Promise<TableResult> => {
  const parameters = candidate.parameters;

  const { tableName, ttlAttribute } = parameters;

  return OperationLogger.logExecution(TableServiceName, tableName, 'creation', async (logger) => {
    const response = await createTable(logger, parameters);

    if (ttlAttribute) {
      await updateTimeToLive(logger, response.tableName, {
        attributeName: ttlAttribute,
        enabled: true
      });
    }

    return {
      tableName: response.tableName,
      streamArn: response.streamArn,
      tableArn: response.tableArn
    };
  });
};

const updateResource = (candidate: TableState, current: TableState): Promise<TableResult> => {
  const { result, parameters } = candidate;
  const { tableName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(TableServiceName, tableName);
  }

  return OperationLogger.logExecution(TableServiceName, tableName, 'updates', async (logger) => {
    const newResult = await checkStreamsUpdates(logger, tableName, parameters, current.parameters);

    await checkCapacityUpdates(logger, tableName, parameters, current.parameters);
    await checkDeletionUpdates(logger, tableName, parameters, current.parameters);
    await checkTimeToLiveUpdates(logger, tableName, parameters, current.parameters);
    await checkIndexUpdates(logger, tableName, parameters, current.parameters);
    await checkTagUpdates(logger, result.tableArn, parameters, current.parameters);

    return {
      ...result,
      ...newResult
    };
  });
};

const deleteResource = async (current: TableState, context: StepContext) => {
  const { result, parameters } = current;

  const allowDeletion = !!parameters.allowDeletion;

  if (!result || (!allowDeletion && !context.force)) {
    return;
  }

  const { tableName } = result;

  await OperationLogger.logExecution(TableServiceName, tableName, 'deletion', async (logger) => {
    if (!allowDeletion) {
      await updateDeletion(logger, tableName, true);
    }

    await deleteTable(logger, tableName);
  });
};

const checkStreamsUpdates = async (logger: OperationLogLine, tableName: string, candidate: TableParameters, current: TableParameters) => {
  const enableStreams = !!candidate.enableStreams;

  if (enableStreams !== !!current.enableStreams) {
    return updateStreams(logger, tableName, enableStreams);
  }

  return undefined;
};

const checkCapacityUpdates = async (logger: OperationLogLine, tableName: string, candidate: TableParameters, current: TableParameters) => {
  const hasChanges = !deepEqual(candidate.capacityUnits ?? {}, current.capacityUnits ?? {});

  if (hasChanges) {
    await updateCapacity(logger, tableName, candidate.capacityUnits);
  }
};

const checkDeletionUpdates = async (logger: OperationLogLine, tableName: string, candidate: TableParameters, current: TableParameters) => {
  const allowDeletion = !!candidate.allowDeletion;

  if (allowDeletion !== !!current.allowDeletion) {
    await updateDeletion(logger, tableName, allowDeletion);
  }
};

const checkTimeToLiveUpdates = async (
  logger: OperationLogLine,
  tableName: string,
  candidate: TableParameters,
  current: TableParameters
) => {
  const newAttributeName = candidate.ttlAttribute;
  const oldAttributeName = current.ttlAttribute;

  if (newAttributeName !== oldAttributeName && (newAttributeName || oldAttributeName)) {
    await updateTimeToLive(logger, tableName, {
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

const checkIndexUpdates = async (logger: OperationLogLine, tableName: string, candidate: TableParameters, current: TableParameters) => {
  const [, ...targetAttributeSchema] = candidate.attributeSchema;
  const [, ...sourceAttributeSchema] = current.attributeSchema;

  const targetAttributeSchemaMap = getAttributeSchemaMap(targetAttributeSchema);
  const sourceAttributeSchemaMap = getAttributeSchemaMap(sourceAttributeSchema);

  const attributeSchemaChanges = deepCompare(targetAttributeSchemaMap, sourceAttributeSchemaMap);

  if (attributeSchemaChanges.create) {
    for (const indexName in attributeSchemaChanges.create) {
      const exists = await importIndex(logger, tableName, targetAttributeSchemaMap[indexName]);

      if (!exists) {
        await createIndex(logger, tableName, targetAttributeSchemaMap[indexName]);
      }
    }
  }

  if (attributeSchemaChanges.update) {
    for (const indexName in attributeSchemaChanges.update) {
      await deleteIndex(logger, tableName, sourceAttributeSchemaMap[indexName]);
      await createIndex(logger, tableName, targetAttributeSchemaMap[indexName]);
    }
  }

  if (attributeSchemaChanges.remove) {
    for (const indexName in attributeSchemaChanges.remove) {
      await deleteIndex(logger, tableName, sourceAttributeSchemaMap[indexName]);
    }
  }
};

const checkTagUpdates = async (logger: OperationLogLine, tableArn: Arn, candidate: TableParameters, current: TableParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagTable(logger, tableArn, tags),
    (tags) => untagTable(logger, tableArn, tags)
  );
};
