import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { base64Encode } from '@ez4/utils';
import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('array type transformation', () => {
  it('assert :: array', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      nullable: true,
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform('123', schema), [123]);
    deepEqual(transform('4.56', schema), [4.56]);

    deepEqual(transform('123, 4.56', schema), [123, 4.56]);
    deepEqual(transform('789', schema), [789]);

    deepEqual(transform(['123', '4.56'], schema), [123, 4.56]);
    deepEqual(transform([789], schema), [789]);

    deepEqual(transform(['7.89', 'abc'], schema), [7.89, 'abc']);

    deepEqual(transform(123, schema), 123);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: array (default)', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      definitions: {
        default: [789, 10.1]
      },
      element: {
        type: SchemaType.Number
      }
    };

    // transform
    deepEqual(transform(['123', '4.56'], schema), [123, 4.56]);

    // incompatible
    deepEqual(transform(['7.89', 'abc'], schema), [7.89, 'abc']);
    deepEqual(transform(123, schema), 123);
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), [789, 10.1]);
  });

  it('assert :: array (no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    };

    const context = createTransformContext({
      return: false
    });

    deepEqual(transform(['123', '4.56'], schema, context), [123, 4.56]);
    deepEqual(transform([789], schema, context), [789]);

    deepEqual(transform(['7.89', 'abc'], schema, context), [7.89, undefined]);

    deepEqual(transform(123, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: array (from string)', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform('123, 4.56', schema), [123, 4.56]);
  });

  it('assert :: array (base64 encoded)', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      definitions: {
        encoded: true
      },
      element: {
        type: SchemaType.Number
      }
    };

    const rawInput = [123, 456];

    const b64Input = base64Encode(JSON.stringify([123, 456]));

    deepEqual(transform(b64Input, schema), rawInput);
    deepEqual(transform(rawInput, schema), b64Input);
  });
});
