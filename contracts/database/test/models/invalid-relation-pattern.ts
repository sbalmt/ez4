import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'testTable';
      relations: {
        // Only `string` is allowed for relations entries.
        'foo:id': 123;
      };
      indexes: {};
      schema: {};
    }
  ];
}
