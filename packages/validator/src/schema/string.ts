import type { StringSchema } from '@ez4/schema';
import type { StringFormatHandler } from '../types/string.js';
import type { ValidationContext } from '../types/context.js';

import { isAnyNumber } from '@ez4/utils';

import { DuplicateStringFormatError } from '../errors/format.js';
import { ExpectedStringTypeError, UnexpectedMaxLengthError, UnexpectedMinLengthError, UnexpectedStringError } from '../errors/string.js';
import { isOptionalNullable } from './utils.js';

const allCustomFormats: Record<string, StringFormatHandler | undefined> = {};

export const validateString = (value: unknown, schema: StringSchema, context?: ValidationContext) => {
  if (isOptionalNullable(value, schema)) {
    return [];
  }

  const property = context?.property;

  if (typeof value !== 'string') {
    return [new ExpectedStringTypeError(property)];
  }

  const { definitions } = schema;

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

  return validateStringFormat(input, schema, property);
};

export const registerStringFormat = (format: string, handler: StringFormatHandler) => {
  if (allCustomFormats[format]) {
    throw new DuplicateStringFormatError(format);
  }

  allCustomFormats[format] = handler;
};

export const validateStringFormat = (value: string, schema: StringSchema, property?: string) => {
  if (schema.format) {
    const customFormat = allCustomFormats[schema.format];

    if (customFormat) {
      return customFormat(value, schema, property);
    }
  }

  return [];
};
