import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createValidatorContext, validate } from '@ez4/validator';
import { NamingStyle, SchemaType } from '@ez4/schema';

describe('naming validation', () => {
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
      }
    }
  };

  it('assert :: camel case', async () => {
    const payload = {
      fooFoo: 'abc',
      fooBar: 123,
      fooBaz: 'abc',
      fooQux: 123
    };

    const context = createValidatorContext({
      inputStyle: NamingStyle.CamelCase
    });

    equal((await validate(payload, schema, context)).length, 0);
  });

  it('assert :: pascal case', async () => {
    const payload = {
      FooFoo: 'abc',
      FooBar: 123,
      FooBaz: 'abc',
      FooQux: 123
    };

    const context = createValidatorContext({
      inputStyle: NamingStyle.PascalCase
    });

    equal((await validate(payload, schema, context)).length, 0);
  });

  it('assert :: snake case', async () => {
    const payload = {
      foo_foo: 'abc',
      foo_bar: 123,
      foo_baz: 'abc',
      foo_qux: 123
    };

    const context = createValidatorContext({
      inputStyle: NamingStyle.SnakeCase
    });

    equal((await validate(payload, schema, context)).length, 0);
  });

  it('assert :: kebab case', async () => {
    const payload = {
      'foo-foo': 'abc',
      'foo-bar': 123,
      'foo-baz': 'abc',
      'foo-qux': 123
    };

    const context = createValidatorContext({
      inputStyle: NamingStyle.KebabCase
    });

    equal((await validate(payload, schema, context)).length, 0);
  });
});
