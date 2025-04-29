import type { Client, Database, ParametersType, TransactionType } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

export declare class TestDatabase extends Database.Service {
  engine: {
    parameters: ParametersType.OnlyIndex;
    transaction: TransactionType.Static;
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
