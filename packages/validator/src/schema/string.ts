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

    const { extra } = schema;

    if (extra?.minLength && value.length < extra.minLength) {
      return [new UnexpectedMinLengthError(extra.minLength, property)];
    }

    if (extra?.maxLength && value.length > extra.maxLength) {
      return [new UnexpectedMaxLengthError(extra.maxLength, property)];
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
