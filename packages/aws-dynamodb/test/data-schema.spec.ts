import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { preparePartialSchema } from '@ez4/aws-dynamodb/client';
import { validateSchema } from '@ez4/aws-dynamodb/runtime';
import { ObjectSchema, SchemaType } from '@ez4/schema';

describe.only('dynamodb data schema', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    identity: 0,
    properties: {
      id: {
        type: SchemaType.String
      },
      foo: {
        type: SchemaType.Number,
        optional: true
      },
      bar: {
        type: SchemaType.Object,
        identity: 1,
        properties: {
          barFoo: {
            type: SchemaType.String
          },
          barBar: {
            type: SchemaType.Boolean
          }
        }
      }
    }
  };

  it('assert :: partial schema', async () => {
    const data = {
      id: '00000000-0000-1000-9000-000000000001',
      foo: undefined,
      bar: {
        barFoo: 'abc',
        barBar: true
      }
    };

    const schema = preparePartialSchema(testSchema, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      identity: 0,
      definitions: {
        extensible: true
      },
      properties: {
        id: testSchema.properties.id,
        bar: {
          ...testSchema.properties.bar,
          definitions: {
            extensible: true
          }
        }
      }
    });

    await validateSchema(data, schema);
  });
});
