import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert';

import { getHeaders, getPathParameters, getQueryStrings, getRequestBody, getResponseBody } from '@ez4/gateway/utils';
import { NamingStyle, SchemaType } from '@ez4/schema';

describe('http utils', () => {
  it('assert :: get identity', async () => {
    const identitySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const identityInput = {
      fooKey: 'foo'
    };

    const identityOutput = await getHeaders(identityInput, identitySchema);

    deepEqual(identityOutput, {
      fooKey: 'foo'
    });
  });

  it('assert :: get headers', async () => {
    const headersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        'x-foo-key': {
          type: SchemaType.String
        }
      }
    };

    const headersInput = {
      'x-foo-key': 'foo',

      // Ignored properties
      'x-foo-bar': 'ignored'
    };

    const headersOutput = await getHeaders(headersInput, headersSchema);

    deepEqual(headersOutput, {
      'x-foo-key': 'foo'
    });
  });

  it('assert :: get path parameters', async () => {
    const parametersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const parametersInput = {
      fooKey: 'foo',

      // Ignored properties
      fooBar: 'ignored'
    };

    const parametersOutput = await getPathParameters(parametersInput, parametersSchema);

    deepEqual(parametersOutput, {
      fooKey: 'foo'
    });
  });

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

    const bodyOutput = await getRequestBody(bodyInput, bodySchema, {
      namingStyle: NamingStyle.SnakeCase
    });

    deepEqual(bodyOutput, {
      fooKey: 'foo',
      bar_Key: {
        bazKey: true
      }
    });
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

    const bodyOutput = await getResponseBody(bodyInput, bodySchema, {
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
