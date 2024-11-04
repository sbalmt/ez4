import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { TableState, TableResult, TableParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError, waitDeletion } from '@ez4/aws-common';
import { deepCompare, deepCompareArray } from '@ez4/utils';

import {
  createTable,
  deleteTable,
  updateTimeToLive,
  updateDeletion,
  updateStreams,
  createIndex,
  deleteIndex,
  tagTable,
  untagTable
} from './client.js';

import { TableServiceName } from './types.js';

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

  await checkTimeToLiveUpdates(result.tableName, parameters, current.parameters);
  await checkDeletionUpdates(result.tableName, parameters, current.parameters);
  await checkStreamsUpdates(result.tableName, parameters, current.parameters);
  await checkIndexUpdates(result.tableName, parameters, current.parameters);
  await checkTagUpdates(result.tableArn, parameters, current.parameters);
};

const deleteResource = async (candidate: TableState) => {
  const { result, parameters } = candidate;

  if (!result || !parameters.allowDeletion) {
    return;
  }

  // If the table is still in use due to a prior change that's not
  // done yet, keep retrying until max attempts.
  await waitDeletion(() => deleteTable(result.tableName));
};

const checkDeletionUpdates = async (
  tableName: string,
  candidate: TableParameters,
  current: TableParameters
) => {
  const allowDeletion = !!candidate.allowDeletion;

  if (allowDeletion !== !!current.allowDeletion) {
    await updateDeletion(tableName, allowDeletion);
  }
};

const checkStreamsUpdates = async (
  tableName: string,
  candidate: TableParameters,
  current: TableParameters
) => {
  const enableStreams = !!candidate.enableStreams;

  if (enableStreams !== !!current.enableStreams) {
    await updateStreams(tableName, enableStreams);
  }
};

const checkTimeToLiveUpdates = async (
  tableName: string,
  candidate: TableParameters,
  current: TableParameters
) => {
  const newAttributeName = candidate.ttlAttribute;
  const oldAttributeName = current.ttlAttribute;

  if (newAttributeName !== oldAttributeName && (newAttributeName || oldAttributeName)) {
    await updateTimeToLive(tableName, {
      attributeName: newAttributeName ?? oldAttributeName!,
      enabled: !!newAttributeName
    });
  }
};

const checkIndexUpdates = async (
  tableName: string,
  candidate: TableParameters,
  current: TableParameters
) => {
  const target = candidate.secondarySchema ?? [];
  const source = current.secondarySchema ?? [];

  const changes = deepCompareArray(target, source);

  if (!changes.counts) {
    return;
  }

  if (changes.create) {
    for (const index in changes.create) {
      await createIndex(tableName, target[index]);
    }
  }

  if (changes.update) {
    for (const index in changes.update) {
      await deleteIndex(tableName, source[index]);
      await createIndex(tableName, target[index]);
    }
  }

  if (changes.remove) {
    for (const index in changes.remove) {
      await deleteIndex(tableName, source[index]);
    }
  }
};

const checkTagUpdates = async (
  tableArn: Arn,
  candidate: TableParameters,
  current: TableParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagTable(tableArn, tags),
    (tags) => untagTable(tableArn, tags)
  );
};
