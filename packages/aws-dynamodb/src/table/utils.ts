import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { TableState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { TableNotFoundError } from './errors.js';
import { TableServiceType } from './types.js';

export const createTableStateId = (gatewayId: string) => {
  return hashData(TableServiceType, toKebabCase(gatewayId));
};

export const isTableState = (resource: EntryState): resource is TableState => {
  return resource.type === TableServiceType;
};

export const getTableState = (context: EventContext, tableName: string, options: DeployOptions) => {
  const tableState = context.getServiceState(tableName, options);

  if (!isTableState(tableState)) {
    throw new TableNotFoundError(tableName);
  }

  return tableState;
};

export const getTableStreamArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const resource = context.getDependencies<TableState>(TableServiceType).at(0)?.result;

  if (!resource?.streamArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'streamArn');
  }

  return resource.streamArn;
};
