import type { Database, InsensitiveMode, LockMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';

// @ts-expect-error Incomplete engine, missing name.
export declare class TestDatabase extends Database.Service<{
  parametersMode: ParametersMode.OnlyIndex;
  transactionMode: TransactionMode.Static;
  insensitiveMode: InsensitiveMode.Unsupported;
  paginationMode: PaginationMode.Offset;
  orderMode: OrderMode.AnyColumns;
  lockMode: LockMode.Unsupported;
}> {
  tables: [];
}
