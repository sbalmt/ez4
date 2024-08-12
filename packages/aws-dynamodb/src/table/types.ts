import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const TableServiceName = 'AWS:DynamoDB/Table';

export const TableServiceType = 'aws:dynamodb.table';

export type TableParameters = CreateRequest;

export type TableResult = CreateResponse;

export type TableState = EntryState & {
  type: typeof TableServiceType;
  parameters: TableParameters;
  result?: TableResult;
};
