import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    Database.UseTable<{
      name: 'testTable';
      schema: {};
      indexes: {};

      // No extra property is allowed.
      invalid_property: true;
    }>
  ];
}
