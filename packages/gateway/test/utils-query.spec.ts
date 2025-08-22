import type { ObjectSchema } from '@ez4/schema';

import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HttpBadRequestError } from '@ez4/gateway';
import { NamingStyle, SchemaType } from '@ez4/schema';
import { getQueryStrings } from '@ez4/gateway/utils';

describe('http query utils', () => {
  it('assert :: get query strings', async () => {
    const querySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        },
        bar_Key: {
          type: SchemaType.Boolean
        },
        BazKey: {
          type: SchemaType.Number
        }
      }
    };

    const queryInput = {
      'foo-key': 'foo',
      'bar-key': 'true',
      'baz-key': '123',

      // Ignored properties
      qux: 'ignored'
    };

    const queryOutput = await getQueryStrings(queryInput, querySchema, {
      namingStyle: NamingStyle.KebabCase
    });

    deepEqual(queryOutput, {
      fooKey: 'foo',
      bar_Key: true,
      BazKey: 123
    });
  });

  it('assert :: get query strings (wrong parameter format)', async () => {
    const querySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        },
        barKey: {
          type: SchemaType.Boolean
        },
        bazKey: {
          type: SchemaType.Number
        }
      }
    };

    const queryInput = {
      fooKey: 'foo',
      barKey: 'true',
      bazKey: 'abc'
    };

    await rejects(() => getQueryStrings(queryInput, querySchema), HttpBadRequestError);
  });
});
