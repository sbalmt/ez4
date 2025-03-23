import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { transform } from '@ez4/transform';

describe('types transform', () => {
  it('assert :: boolean', () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean,
      nullable: true
    };

    deepEqual(transform(true, schema), true);
    deepEqual(transform('true', schema), true);
    deepEqual(transform('false', schema), false);
    deepEqual(transform('abc', schema), undefined);
    deepEqual(transform(0, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: number', () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      nullable: true
    };

    deepEqual(transform('123', schema), 123);
    deepEqual(transform('4.56', schema), 4.56);

    deepEqual(transform('abc', schema), undefined);
    deepEqual(transform(false, schema), undefined);
    deepEqual(transform(true, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);

    deepEqual(transform(null, schema), null);
  });

  it('assert :: string', () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      nullable: true,
      definitions: {
        trim: true
      }
    };

    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(' def ', schema), 'def');

    deepEqual(transform(true, schema), undefined);
    deepEqual(transform(false, schema), undefined);
    deepEqual(transform(123, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);

    deepEqual(transform(null, schema), null);
  });

  it('assert :: object', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      nullable: true,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Boolean
        },
        bar: {
          type: SchemaType.Number
        },
        baz: {
          type: SchemaType.String
        }
      }
    };

    const output = {
      foo: true,
      bar: 123,
      baz: 'abc'
    };

    deepEqual(transform({ foo: 'true', bar: '123', baz: 'abc' }, schema), output);

    deepEqual(transform(undefined, schema), undefined);

    deepEqual(transform(null, schema), null);
  });

  it('assert :: reference', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        value: {
          type: SchemaType.Number
        },
        next: {
          type: SchemaType.Reference,
          identity: 1,
          optional: true
        }
      }
    };

    const input = {
      value: '123',
      next: {
        value: '456',
        next: {
          value: '789'
        }
      }
    };

    const output = {
      value: 123,
      next: {
        value: 456,
        next: {
          value: 789
        }
      }
    };

    deepEqual(transform(input, schema), output);
  });

  it('assert :: union', () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      nullable: true,
      elements: [
        {
          type: SchemaType.Boolean
        },
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    deepEqual(transform('false', schema), false);
    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform('123', schema), 123);

    deepEqual(transform(undefined, schema), undefined);

    deepEqual(transform(null, schema), null);
  });

  it('assert :: array', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      nullable: true,
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform(['123', '4.56'], schema), [123, 4.56]);

    deepEqual(transform(['7.89', 'abc'], schema), [7.89, undefined]);
    deepEqual(transform(123, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);

    deepEqual(transform(null, schema), null);
  });

  it('assert :: tuple', () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      nullable: true,
      elements: [
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    deepEqual(transform(['123', 'abc'], schema), [123, 'abc']);

    deepEqual(transform(['true', '4.56'], schema), [undefined, '4.56']);
    deepEqual(transform(123, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);

    deepEqual(transform(null, schema), null);
  });

  it('assert :: enum', () => {
    const schema: AnySchema = {
      type: SchemaType.Enum,
      nullable: true,
      options: [
        {
          value: 123
        },
        {
          value: 'abc'
        }
      ]
    };

    deepEqual(transform('123', schema), 123);
    deepEqual(transform('abc', schema), 'abc');

    deepEqual(transform(undefined, schema), undefined);

    deepEqual(transform(null, schema), null);
  });
});
