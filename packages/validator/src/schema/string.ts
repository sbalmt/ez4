import type { StringSchema } from '@ez4/schema';

import {
  ExpectedStringTypeError,
  UnexpectedMaxLengthError,
  UnexpectedMinLengthError
} from '../errors/string.js';

import { DuplicateStringFormatError } from '../errors/format.js';
import { StringFormatHandler } from '../types/string.js';
import { isOptionalNullable } from './utils.js';

const allCustomFormats: Record<string, StringFormatHandler | undefined> = {};

export const validateString = (value: unknown, schema: StringSchema, property?: string) => {
  if (!isOptionalNullable(value, schema)) {
    if (typeof value !== 'string') {
      return [new ExpectedStringTypeError(property)];
    }

    if (schema.minLength && value.length < schema.minLength) {
      return [new UnexpectedMinLengthError(schema.minLength, property)];
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      return [new UnexpectedMaxLengthError(schema.maxLength, property)];
    }

    return validateStringFormat(value, schema, property);
  }

  return [];
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
