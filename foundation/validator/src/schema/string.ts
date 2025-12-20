import type { StringSchema } from '@ez4/schema';
import type { StringFormatHandler } from '../types/string';
import type { ValidationContext } from '../types/context';

import { isAnyNumber } from '@ez4/utils';

import { DuplicateStringFormatError } from '../errors/format';
import { ExpectedStringTypeError, UnexpectedMaxLengthError, UnexpectedMinLengthError, UnexpectedStringError } from '../errors/string';
import { useCustomValidation } from '../utils/custom';
import { isNullish } from '../utils/nullish';

const allCustomFormats: Record<string, StringFormatHandler | undefined> = {};

export const validateString = async (value: unknown, schema: StringSchema, context?: ValidationContext) => {
  if (isNullish(value, schema)) {
    return [];
  }

  const property = context?.property;

  if (typeof value !== 'string') {
    return [new ExpectedStringTypeError(property)];
  }

  const definitions = schema.definitions;

  const input = definitions?.trim ? value.trim() : value;

  if (definitions?.value && input !== definitions.value) {
    return [new UnexpectedStringError(definitions.value, property)];
  }

  if (isAnyNumber(definitions?.minLength) && input.length < definitions.minLength) {
    return [new UnexpectedMinLengthError(definitions.minLength, property)];
  }

  if (isAnyNumber(definitions?.maxLength) && input.length > definitions.maxLength) {
    return [new UnexpectedMaxLengthError(definitions.maxLength, property)];
  }

  const allErrors = await validateStringFormat(input, schema, property);

  if (!allErrors.length && definitions?.type && context) {
    return useCustomValidation(value, schema, definitions.type, context);
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
