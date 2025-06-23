import type { Database, InsensitiveMode, OrderMode, PaginationMode, ParametersMode, TransactionMode } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  // @ts-ignore Incomplete engine, missing name.
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    insensitiveMode: InsensitiveMode.Unsupported;
    paginationMode: PaginationMode.Offset;
    orderMode: OrderMode.AnyColumns;
  };

  tables: [];
}
