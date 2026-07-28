import type { StringSchema } from '@ez4/schema';
import type { StringFormatHandler } from '../types/string';
import type { ValidationContext } from '../types/context';

import { isAnyBoolean, isAnyNumber, isAnyString, isNotNullish } from '@ez4/utils';

import { DuplicateStringFormatError } from '../errors/format';
import { ExpectedStringTypeError, UnexpectedMaxLengthError, UnexpectedMinLengthError, UnexpectedStringError } from '../errors/string';
import { useCustomValidation } from '../utils/custom';
import { isNullishAllowed } from '../utils/nullish';

const allCustomFormats: Record<string, StringFormatHandler | undefined> = {};

const isDefaultAllowed = (value: unknown, schema: StringSchema) => {
  return value === undefined && isNotNullish(schema.definitions?.default);
};

const getValidationInput = (value: unknown, trim?: boolean, context?: ValidationContext) => {
  if (context?.cast && (isAnyNumber(value) || isAnyBoolean(value))) {
    return value.toString();
  }

  if (trim && isAnyString(value)) {
    return value.trim();
  }

  return value;
};

export const validateString = async (value: unknown, schema: StringSchema, context?: ValidationContext) => {
  if (isNullishAllowed(value, schema) || isDefaultAllowed(value, schema)) {
    return [];
  }

  const definitions = schema.definitions;

  const input = getValidationInput(value, definitions?.trim, context);
  const property = context?.property;

  if (!isAnyString(input)) {
    return [new ExpectedStringTypeError(value, property)];
  }

  if (definitions?.value && input !== definitions.value) {
    return [new UnexpectedStringError(value, definitions.value, property)];
  }

  if (isAnyNumber(definitions?.minLength) && input.length < definitions.minLength) {
    return [new UnexpectedMinLengthError(value, definitions.minLength, property)];
  }

  if (isAnyNumber(definitions?.maxLength) && input.length > definitions.maxLength) {
    return [new UnexpectedMaxLengthError(value, definitions.maxLength, property)];
  }

  const allErrors = await validateStringFormat(input, schema, property);

  if (!allErrors.length && definitions?.types && context) {
    return useCustomValidation(input, schema, definitions.types, context);
  }

  return allErrors;
};

export const registerStringFormat = (format: string, handler: StringFormatHandler) => {
  if (allCustomFormats[format]) {
    throw new DuplicateStringFormatError(format);
  }

  allCustomFormats[format] = handler;
};

export const validateStringFormat = (value: string, schema: StringSchema, property?: string) => {
  if (schema.format) {
    const onCustomFormat = allCustomFormats[schema.format];

    if (onCustomFormat) {
      return onCustomFormat(value, schema, property);
    }
  }

  return [];
};
