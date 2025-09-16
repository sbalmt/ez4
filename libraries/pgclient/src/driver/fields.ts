import type { AnySchema } from '@ez4/schema';

import { isDate, isDateTime, isTime, isUUID } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';

import { UnsupportedFieldType } from './errors';
import { isJsonFieldSchema } from './schema';

export type FieldParameter = {
  name: string;
  type?: string;
  value: unknown;
};

export const prepareFieldData = (name: string, value: unknown, schema: AnySchema): FieldParameter => {
  if (isJsonFieldSchema(schema)) {
    return getJsonFieldData(name, value as object);
  }

  if (value === null) {
    return getNullFieldData(name);
  }

  switch (schema.type) {
    case SchemaType.Boolean:
      return getBooleanFieldData(name, value as boolean);

    case SchemaType.Number:
      return getNumberFieldData(name, value as number, schema.format);

    case SchemaType.String:
      return getStringFieldData(name, value as string, schema.format);

    default:
      return getTextFieldData(name, value as string);
  }
};

export const detectFieldData = (name: string, value: unknown): FieldParameter => {
  switch (typeof value) {
    case 'boolean': {
      return getBooleanFieldData(name, value);
    }

    case 'number': {
      if (Number.isSafeInteger(value)) {
        return getIntegerFieldData(name, value);
      }

      return getDecimalFieldData(name, value);
    }

    case 'string': {
      if (isDateTime(value)) {
        return getDateTimeFieldData(name, value);
      }

      if (isDate(value)) {
        return getDateFieldData(name, value);
      }

      if (isTime(value)) {
        return getTimeFieldData(name, value);
      }

      if (isUUID(value)) {
        return getUuidFieldData(name, value);
      }

      return getTextFieldData(name, value);
    }

    case 'object': {
      if (value instanceof Date) {
        return getDateTimeFieldData(name, value.toISOString());
      }

      if (value !== null) {
        return getJsonFieldData(name, value);
      }

      return getNullFieldData(name);
    }

    default:
      throw new UnsupportedFieldType(name, typeof value);
  }
};

const getBooleanFieldData = (name: string, value: boolean): FieldParameter => {
  return {
    name,
    type: 'boolean',
    value
  };
};

const getIntegerFieldData = (name: string, value: number): FieldParameter => {
  return {
    name,
    type: 'bigint',
    value
  };
};

const getDecimalFieldData = (name: string, value: number): FieldParameter => {
  return {
    name,
    type: 'decimal',
    value
  };
};

const getTextFieldData = (name: string, value: string): FieldParameter => {
  return {
    name,
    type: 'text',
    value
  };
};

const getUuidFieldData = (name: string, value: string): FieldParameter => {
  return {
    ...getTextFieldData(name, value),
    type: 'uuid'
  };
};

const getDateFieldData = (name: string, value: string): FieldParameter => {
  return {
    ...getTextFieldData(name, value),
    type: 'date'
  };
};

const getTimeFieldData = (name: string, value: string): FieldParameter => {
  return {
    ...getTextFieldData(name, value),
    type: 'time'
  };
};

const getDateTimeFieldData = (name: string, value: string): FieldParameter => {
  return {
    ...getTextFieldData(name, new Date(value).toISOString()),
    type: 'timestamp'
  };
};

const getJsonFieldData = (name: string, value: unknown): FieldParameter => {
  return {
    ...getTextFieldData(name, JSON.stringify(value)),
    type: 'jsonb'
  };
};

const getNullFieldData = (name: string): FieldParameter => {
  return {
    name,
    value: null
  };
};

const getNumberFieldData = (name: string, value: number, format?: string): FieldParameter => {
  if (format === 'integer') {
    return getIntegerFieldData(name, value);
  }

  return getDecimalFieldData(name, value);
};

const getStringFieldData = (name: string, value: string, format?: string): FieldParameter => {
  switch (format) {
    case 'uuid':
      return getUuidFieldData(name, value);

    case 'time':
      return getTimeFieldData(name, value);

    case 'date':
      return getDateFieldData(name, value);

    case 'date-time':
      return getDateTimeFieldData(name, value);

    default:
      return getTextFieldData(name, value);
  }
};
