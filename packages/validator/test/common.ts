import type { AnySchema } from '@ez4/schema';

import { equal, ok } from 'node:assert/strict';

import {
  validate,
  UnexpectedTypeError,
  UnexpectedPropertiesError,
  UnexpectedEnumValueError,
  UnexpectedMinRangeError,
  UnexpectedMaxRangeError,
  UnexpectedMinLengthError,
  UnexpectedMaxLengthError
} from '@ez4/validator';

type ErrorTypes =
  | typeof UnexpectedPropertiesError
  | typeof UnexpectedEnumValueError
  | typeof UnexpectedMinRangeError
  | typeof UnexpectedMaxRangeError
  | typeof UnexpectedMinLengthError
  | typeof UnexpectedMaxLengthError
  | typeof UnexpectedTypeError;

export const assertError = async (value: unknown, schema: AnySchema, errors: ErrorTypes[]) => {
  const resultErrors = await validate(value, schema);

  equal(resultErrors.length, errors.length);

  for (let index = 0; index < errors.length; index++) {
    ok(resultErrors[index] instanceof errors[index]);
  }
};
