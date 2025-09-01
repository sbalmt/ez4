import type { Client, Database, ParametersMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineParameters } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngineParameters<ParametersMode.NameAndIndex>;

  client: Client<TestDatabase>;

  tables: [];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
  selfClient.rawQuery('SELECT * FROM test WHERE id = :0', [123]);

  selfClient.rawQuery('SELECT * FROM test WHERE id = :id', {
    id: 123
  });
}
