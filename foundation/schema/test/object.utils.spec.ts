import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getObjectSchemaProperty, SchemaType } from '@ez4/schema';

describe('schema object utils', () => {
  const fullSchema: ObjectSchema = {
    type: SchemaType.Object,
    identity: 1,
    properties: {
      foo: {
        type: SchemaType.Boolean
      }
    },
    additional: {
      property: {
        type: SchemaType.Number
      },
      value: {
        type: SchemaType.String
      }
    }
  };

  it('assert :: get property', () => {
    const additionalProperty = getObjectSchemaProperty(fullSchema, 'foo');

    deepEqual(additionalProperty, {
      type: SchemaType.Boolean
    });
  });

  it('assert :: get additional property', () => {
    const additionalProperty = getObjectSchemaProperty(fullSchema, 'xyz');

    deepEqual(additionalProperty, {
      type: SchemaType.String
    });
  });
});
