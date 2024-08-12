import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { TableState, TableResult, TableParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError, waitDeletion } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import {
  createTable,
  deleteTable,
  tagTable,
  untagTable,
  updateStreams,
  updateDeletion,
  updateTable
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
  const parameters = candidate.parameters;
  const changes = deepCompare(parameters, current.parameters);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: parameters.tableName
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

  return {
    tableName: response.tableName,
    streamArn: response.streamArn,
    tableArn: response.tableArn
  };
};

const updateResource = async (candidate: TableState, current: TableState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const parameters = candidate.parameters;

  await checkTagUpdates(result.tableArn, parameters, current.parameters);
  await checkDeletionUpdates(result.tableName, parameters, current.parameters);
  await checkStreamsUpdates(result.tableName, parameters, current.parameters);

  const newResult = await checkGeneralUpdates(result, parameters, current.parameters);

  return newResult;
};

const deleteResource = async (candidate: TableState) => {
  const result = candidate.result;

  if (!result || !candidate.parameters.allowDeletion) {
    return;
  }

  // If the table is still in use due to a prior change that's not reflected
  // on the table status, `waitFor` will keep retrying until max attempts.
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

const checkGeneralUpdates = async (
  result: TableResult,
  candidate: TableParameters,
  current: TableParameters
) => {
  const hasChanges = !deepEqual(candidate, current, {
    enableStreams: true,
    allowDeletion: true,
    tags: true
  });

  if (hasChanges) {
    return updateTable(result.tableName, candidate);
  }

  return result;
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
