import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { rejects } from 'node:assert';

import { getHeaders, getIdentity, getPathParameters, getQueryStrings, getRequestBody } from '@ez4/gateway/utils';
import { HttpBadRequestError } from '@ez4/gateway';
import { SchemaType } from '@ez4/schema';

describe('http utils errors', () => {
  it('assert :: get identity (unexpected property)', async () => {
    const identitySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const identityInput = {
      fooKey: 'foo',
      barKey: 'unexpected'
    };

    await rejects(() => getIdentity(identityInput, identitySchema), HttpBadRequestError);
  });

  it('assert :: get headers (wrong parameter format)', async () => {
    const headersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        'x-foo-key': {
          type: SchemaType.String
        }
      }
    };

    const headersInput = {
      'x-foo-key': 123
    };

    await rejects(() => getHeaders(headersInput, headersSchema), HttpBadRequestError);
  });

  it('assert :: get path parameters (wrong parameter format)', async () => {
    const parametersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const parametersInput = {
      fooKey: 123
    };

    await rejects(() => getPathParameters(parametersInput, parametersSchema), HttpBadRequestError);
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

    await rejects(() => getRequestBody(bodyInput, bodySchema), HttpBadRequestError);
  });
});
