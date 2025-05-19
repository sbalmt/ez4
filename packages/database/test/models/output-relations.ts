import type { Database, Index, ParametersMode, TransactionMode, OrderMode } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  tables: [
    {
      name: 'parentTestTable';
      schema: {
        id: string;
      };
      relations: {
        'id@children': 'childTestTable:parent_id';
      };
      indexes: {
        id: Index.Primary;
      };
    },
    {
      name: 'childTestTable';
      schema: {
        id: string;
        parent_id: string;
      };
      relations: {
        'parent_id@parent': 'parentTestTable:id';
      };
      indexes: {
        id: Index.Primary;
        parent_id: Index.Secondary;
      };
    }
  ];
}
