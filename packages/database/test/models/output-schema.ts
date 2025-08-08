import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines.js';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'inlineTestTable';
      schema: {
        foo: string;
      };
      indexes: {};
    },
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {};
    }
  ];
}

declare class TestSchema implements Database.Schema {
  foo?: string;

  bar: number | null;

  baz: {
    nested: boolean;
  };

  qux: {
    [key: string]: number;
  };
}
