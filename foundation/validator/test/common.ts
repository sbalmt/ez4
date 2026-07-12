import type { AnySchema } from '@ez4/schema';

import { equal, ok } from 'node:assert/strict';

import {
  validate,
  UnexpectedEnumValueError,
  UnexpectedPropertiesError,
  ExpectedDateTimeFormatError,
  ExpectedDateFormatError,
  ExpectedEmailFormatError,
  ExpectedIntegerTypeError,
  ExpectedRegexFormatError,
  ExpectedTimeFormatError,
  ExpectedUUIDTypeError,
  UnexpectedMaxLengthError,
  UnexpectedMaxRangeError,
  UnexpectedMinLengthError,
  UnexpectedMinRangeError,
  UnexpectedNumberError,
  UnexpectedStringError,
  UnexpectedBooleanError
} from '@ez4/validator';

type ErrorTypes =
  | typeof UnexpectedEnumValueError
  | typeof UnexpectedPropertiesError
  | typeof ExpectedDateTimeFormatError
  | typeof ExpectedDateFormatError
  | typeof ExpectedEmailFormatError
  | typeof ExpectedIntegerTypeError
  | typeof ExpectedRegexFormatError
  | typeof ExpectedTimeFormatError
  | typeof ExpectedUUIDTypeError
  | typeof UnexpectedMaxLengthError
  | typeof UnexpectedMaxRangeError
  | typeof UnexpectedMinLengthError
  | typeof UnexpectedMinRangeError
  | typeof UnexpectedBooleanError
  | typeof UnexpectedNumberError
  | typeof UnexpectedStringError;

export const assertError = async (value: unknown, schema: AnySchema, errors: ErrorTypes[]) => {
  const resultErrors = await validate(value, schema);

  equal(resultErrors.length, errors.length);

  for (let index = 0; index < errors.length; index++) {
    ok(resultErrors[index] instanceof errors[index]);
  }
};
