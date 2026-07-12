import type { ObjectSchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';

import { prepareRequestUrl } from '../src/main';

describe('http url utils', () => {
  const schema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      numeric: {
        type: SchemaType.Number
      },
      string: {
        type: SchemaType.String
      },
      flag1: {
        type: SchemaType.Boolean
      },
      flag2: {
        type: SchemaType.Boolean
      },
      date: {
        type: SchemaType.String
      },
      array: {
        type: SchemaType.Array,
        element: {
          type: SchemaType.String
        }
      },
      object: {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.String
          },
          bar: {
            type: SchemaType.Number
          }
        }
      }
    }
  };

  it('assert :: request url', () => {
    const url = prepareRequestUrl('https://localhost', '/test-path', {});

    equal(url, 'https://localhost/test-path');
  });

  it('assert :: request url with parameters', () => {
    const url = prepareRequestUrl('https://localhost', '/test-path/{foo}/{bar}', {
      parameters: {
        foo: 'foo-abc',
        bar: 'bar-123'
      }
    });

    equal(url, 'https://localhost/test-path/foo-abc/bar-123');
  });

  it('assert :: request url with query strings (no schema)', () => {
    const url = prepareRequestUrl('https://localhost', '/test-path', {
      query: {
        numeric: 123,
        string: 'abc',
        flag1: true,
        flag2: false,
        date: new Date('2025-11-01T00:00:00-03:00'),
        array: ['foo', 123, new Date('2025-12-01T00:00:00-03:00')],
        object: {
          foo: 'foo',
          bar: 123
        }
      }
    });

    equal(
      url,
      `https://localhost/test-path?` +
        `numeric=123&` +
        `string=abc&` +
        `flag1=true&` +
        `flag2=false&` +
        `date=2025-11-01T03%3A00%3A00.000Z&` +
        `array=foo%2C123%2C2025-12-01T03%3A00%3A00.000Z&` +
        `object=eyJmb28iOiJmb28iLCJiYXIiOjEyM30%3D`
    );
  });

  it('assert :: request url with query strings (with schema)', () => {
    const url = prepareRequestUrl('https://localhost', '/test-path', {
      querySchema: schema,
      query: {
        numeric: 456,
        string: 'def',
        flag1: false,
        flag2: true,
        date: new Date('2025-11-01T00:00:00-03:00'),
        array: ['foo', 123, new Date('2025-12-01T00:00:00-03:00')],
        object: {
          foo: 'foo',
          bar: 123
        }
      }
    });

    equal(
      url,
      `https://localhost/test-path?` +
        `numeric=456&` +
        `string=def&` +
        `flag1=false&` +
        `flag2=true&` +
        `date=2025-11-01T03%3A00%3A00.000Z&` +
        `array=foo%2C123%2C2025-12-01T03%3A00%3A00.000Z&` +
        `object=eyJmb28iOiJmb28iLCJiYXIiOjEyM30%3D`
    );
  });
});
