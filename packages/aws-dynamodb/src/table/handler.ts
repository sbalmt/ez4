import type { Arn } from '@ez4/aws-common';
import type { StepHandler } from '@ez4/stateful';
import type { TableState, TableResult, TableParameters } from './types.js';

import { applyTagUpdates, ReplaceResourceError, waitDeletion } from '@ez4/aws-common';
import { deepEqual } from '@ez4/utils';

import { createTable, deleteTable, tagTable, untagTable, updateTable } from './client.js';
import { TableServiceName } from './types.js';

export const getTableHandler = (): StepHandler<TableState> => ({
  equals: equalsResource,
  replace: replaceResource,
  create: createResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: TableState, current: TableState) => {
  return !!candidate.result && candidate.result.tableArn === current.result?.tableArn;
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
    tableArn: response.tableArn
  };
};

const updateResource = async (candidate: TableState, current: TableState) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  await checkTagUpdates(result.tableArn, candidate.parameters, current.parameters);
  await checkAllowDeletionUpdates(result.tableName, candidate.parameters, current.parameters);
  await checkGeneralUpdates(result.tableName, candidate.parameters, current.parameters);
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

const checkAllowDeletionUpdates = async (
  tableName: string,
  candidate: TableParameters,
  current: TableParameters
) => {
  // Deletion protection updates must have be an isolated request.
  if (candidate.allowDeletion !== current.allowDeletion) {
    await updateTable(tableName, { allowDeletion: candidate.allowDeletion });
  }
};

const checkGeneralUpdates = async (
  tableName: string,
  candidate: TableParameters,
  current: TableParameters
) => {
  const hasChanges = !deepEqual(candidate, current, { allowDeletion: true, tags: true });

  if (hasChanges) {
    await updateTable(tableName, candidate);
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
