import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { ObjectSchema } from '@ez4/schema';
import type { ParametersMode, TransactionMode, InsensitiveMode, PaginationMode, OrderMode, LockMode } from '../types/mode';
import type { Index } from '../types/index';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/database';

export type DatabaseService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    scalability?: DatabaseScalability;
    engine: DatabaseEngine;
    tables: DatabaseTable[];
    name: string;
  };

export type TableSchema = ObjectSchema;

export type StreamHandler = FunctionSignature;

export type DatabaseEngine = {
  parametersMode: ParametersMode;
  transactionMode: TransactionMode;
  insensitiveMode: InsensitiveMode;
  paginationMode: PaginationMode;
  orderMode: OrderMode;
  lockMode: LockMode;
  name: string;
};

export type DatabaseScalability = {
  minCapacity: number;
  maxCapacity: number;
};

export type TableIndex = {
  name: string;
  columns: string[];
  type: Index;
};

export type TableRelation = {
  sourceTable: string;
  sourceColumn: string;
  sourceIndex?: Index;
  targetColumn: string;
  targetAlias: string;
  targetIndex?: Index;
};

export type DatabaseTable = {
  name: string;
  schema: TableSchema;
  relations?: TableRelation[];
  indexes: TableIndex[];
  stream?: TableStream;
};

export type TableStream = {
  listener?: ServiceListener;
  handler: StreamHandler;
  variables?: LinkedVariables;
  architecture?: ArchitectureType;
  runtime?: RuntimeType;
  logRetention?: number;
  logLevel?: LogLevel;
  timeout?: number;
  memory?: number;
  vpc?: boolean;
  files?: string[];
};

export const isDatabaseService = (service: ServiceMetadata): service is DatabaseService => {
  return service.type === ServiceType;
};

export const createDatabaseService = (name: string) => {
  return {
    ...createServiceMetadata<DatabaseService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
