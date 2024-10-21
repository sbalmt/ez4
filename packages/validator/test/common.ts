import type { AnySchema } from '@ez4/schema';

import { equal, ok } from 'node:assert/strict';

import {
  validate,
  UnexpectedEnumValueError,
  UnexpectedPropertiesError,
  ExpectedDateTimeTypeError,
  ExpectedDateTypeError,
  ExpectedEmailTypeError,
  ExpectedIntegerTypeError,
  ExpectedRegexTypeError,
  ExpectedTimeTypeError,
  ExpectedUUIDTypeError,
  UnexpectedMaxLengthError,
  UnexpectedMaxRangeError,
  UnexpectedMinLengthError,
  UnexpectedMinRangeError,
  UnexpectedNumberError,
  UnexpectedStringError
} from '@ez4/validator';

type ErrorTypes =
  | typeof UnexpectedEnumValueError
  | typeof UnexpectedPropertiesError
  | typeof ExpectedDateTimeTypeError
  | typeof ExpectedDateTypeError
  | typeof ExpectedEmailTypeError
  | typeof ExpectedIntegerTypeError
  | typeof ExpectedRegexTypeError
  | typeof ExpectedTimeTypeError
  | typeof ExpectedUUIDTypeError
  | typeof UnexpectedMaxLengthError
  | typeof UnexpectedMaxRangeError
  | typeof UnexpectedMinLengthError
  | typeof UnexpectedMinRangeError
  | typeof UnexpectedNumberError
  | typeof UnexpectedStringError;

export const assertError = async (value: unknown, schema: AnySchema, errors: ErrorTypes[]) => {
  const resultErrors = await validate(value, schema);

  equal(resultErrors.length, errors.length);

  for (let index = 0; index < errors.length; index++) {
    ok(resultErrors[index] instanceof errors[index]);
  }
};
