import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual, rejects } from 'node:assert';

import { HttpBadRequestError } from '@ez4/gateway';
import { resolveRequestBody, resolveResponseBody } from '@ez4/gateway/utils';
import { NamingStyle, SchemaType } from '@ez4/schema';

describe('http body utils', () => {
  it('assert :: get request body', async () => {
    const bodySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        },
        bar_Key: {
          type: SchemaType.Object,
          properties: {
            bazKey: {
              type: SchemaType.Boolean
            }
          }
        }
      }
    };

    const bodyInput = {
      foo_key: 'foo',
      bar_key: {
        baz_key: true
      }
    };

    const bodyOutput = await resolveRequestBody(bodyInput, bodySchema, {
      namingStyle: NamingStyle.SnakeCase
    });

    deepEqual(bodyOutput, {
      fooKey: 'foo',
      bar_Key: {
        bazKey: true
      }
    });
  });

  it('assert :: get request body (wrong parameter format)', async () => {
    const bodySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        },
        barKey: {
          type: SchemaType.Object,
          properties: {
            bazKey: {
              type: SchemaType.Boolean
            }
          }
        }
      }
    };

    const bodyInput = {
      fooKey: 'foo',
      barKey: {
        bazKey: 123
      }
    };

    await rejects(() => resolveRequestBody(bodyInput, bodySchema), HttpBadRequestError);
  });

  it('assert :: get response body', async () => {
    const bodySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        FooKey: {
          type: SchemaType.String
        },
        barKey: {
          type: SchemaType.Object,
          properties: {
            'baz-key': {
              type: SchemaType.Boolean
            }
          }
        }
      }
    };

    const bodyInput = {
      FooKey: 'foo',
      barKey: {
        'baz-key': true
      },

      // Ignored properties
      Baz: 'ignored',
      Qux: undefined
    };

    const bodyOutput = await resolveResponseBody(bodyInput, bodySchema, {
      namingStyle: NamingStyle.SnakeCase
    });

    deepEqual(bodyOutput, {
      foo_key: 'foo',
      bar_key: {
        baz_key: true
      }
    });
  });
});
