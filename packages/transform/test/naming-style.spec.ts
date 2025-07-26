import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { NamingStyle, SchemaType } from '@ez4/schema';

describe('naming transform', () => {
  const schema: AnySchema = {
    type: SchemaType.Object,
    identity: 1,
    properties: {
      fooFoo: {
        type: SchemaType.String
      },
      FooBar: {
        type: SchemaType.Number
      },
      foo_baz: {
        type: SchemaType.String
      },
      'foo-qux': {
        type: SchemaType.Number
      },
      bar: {
        type: SchemaType.Boolean,
        alias: 'BAR'
      }
    }
  };

  it('assert :: camel case', async () => {
    const input = {
      fooFoo: 'abc',
      fooBar: '123',
      fooBaz: 'abc',
      fooQux: '123',
      bar: 'true'
    };

    const output = {
      fooFoo: 'abc',
      fooBar: 123,
      fooBaz: 'abc',
      fooQux: 123,
      BAR: true
    };

    const context = createTransformContext({
      outputStyle: NamingStyle.CamelCase,
      inputStyle: NamingStyle.CamelCase
    });

    deepEqual(transform(input, schema, context), output);
  });

  it('assert :: pascal case', async () => {
    const input = {
      FooFoo: 'abc',
      FooBar: '123',
      FooBaz: 'abc',
      FooQux: '123',
      Bar: 'true'
    };

    const output = {
      FooFoo: 'abc',
      FooBar: 123,
      FooBaz: 'abc',
      FooQux: 123,
      BAR: true
    };

    const context = createTransformContext({
      outputStyle: NamingStyle.PascalCase,
      inputStyle: NamingStyle.PascalCase
    });

    deepEqual(transform(input, schema, context), output);
  });

  it('assert :: snake case', async () => {
    const input = {
      foo_foo: 'abc',
      foo_bar: '123',
      foo_baz: 'abc',
      foo_qux: '123',
      bar: 'true'
    };

    const output = {
      foo_foo: 'abc',
      foo_bar: 123,
      foo_baz: 'abc',
      foo_qux: 123,
      BAR: true
    };

    const context = createTransformContext({
      outputStyle: NamingStyle.SnakeCase,
      inputStyle: NamingStyle.SnakeCase
    });

    deepEqual(transform(input, schema, context), output);
  });

  it('assert :: kebab case', async () => {
    const input = {
      'foo-foo': 'abc',
      'foo-bar': '123',
      'foo-baz': 'abc',
      'foo-qux': '123',
      bar: 'true'
    };

    const output = {
      'foo-foo': 'abc',
      'foo-bar': 123,
      'foo-baz': 'abc',
      'foo-qux': 123,
      BAR: true
    };

    const context = createTransformContext({
      outputStyle: NamingStyle.KebabCase,
      inputStyle: NamingStyle.KebabCase
    });

    deepEqual(transform(input, schema, context), output);
  });
});
