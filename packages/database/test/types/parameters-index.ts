import type { Client, Database, ParametersMode, TransactionMode, OrderMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  client: Client<TestDatabase>;

  tables: [];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
  selfClient.rawQuery('SELECT * FROM test WHERE id = :0', [123]);
}
