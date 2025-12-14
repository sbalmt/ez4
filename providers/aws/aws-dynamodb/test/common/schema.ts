import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

export type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {
    id: string;
    foo?: number | null;
    bar: {
      barFoo: string;
      barBar: boolean;
    };
    baz: string[];
    qux: number[];
  };
};

export const TestSchema: ObjectSchema = {
  type: SchemaType.Object,
  properties: {
    id: {
      type: SchemaType.String
    },
    foo: {
      type: SchemaType.Number,
      optional: true,
      nullable: true
    },
    bar: {
      type: SchemaType.Object,
      properties: {
        barFoo: {
          type: SchemaType.String
        },
        barBar: {
          type: SchemaType.Boolean
        }
      }
    },
    baz: {
      type: SchemaType.Array,
      element: {
        type: SchemaType.String
      }
    },
    qux: {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    }
  }
};
