import type { InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, StreamMode, TransactionMode } from '@ez4/database';

export type TestEngine = {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  streamMode: StreamMode.Supported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';
};

export type TestEngineParameters<P extends ParametersMode> = {
  parametersMode: P;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';
};

export type TestEngineTransaction<T extends TransactionMode> = {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: T;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';
};

export type TestEngineInsensitive<I extends InsensitiveMode> = {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: I;
  paginationMode: PaginationMode.Offset;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';
};

export type TestEnginePagination<P extends PaginationMode> = {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: P;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';
};

export type TestEngineOrder<O extends OrderMode> = {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  streamMode: StreamMode.Unsupported;
  orderMode: O;
  lockMode: LockMode.Unsupported;
  options: never;
  name: 'test';
};

export type TestEngineLock<L extends LockMode> = {
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  streamMode: StreamMode.Unsupported;
  orderMode: OrderMode.AnyColumns;
  lockMode: L;
  options: never;
  name: 'test';
};
