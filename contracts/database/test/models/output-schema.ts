import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'inlineTestTable';
      schema: {
        inline_1: string;
        inline_2: boolean;
        inline_3: number;
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

const enum TestSchemaEnum {
  Foo = 'foo',
  Bar = 'bar'
}

declare class TestSchema implements Database.Schema {
  literal_1: string;
  literal_2: number;
  literal_3: boolean;
  literal_4: 'foo' | 'bar' | 'baz';
  literal_5: TestSchemaEnum;

  nullish_1?: string;
  nullish_2: number | null;

  json_1: {
    nested_1: boolean;
  };

  json_2: {
    [key: string]: number;
  };
}
