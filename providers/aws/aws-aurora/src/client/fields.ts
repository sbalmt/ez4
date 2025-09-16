import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema } from '@ez4/schema';

import { TypeHint } from '@aws-sdk/client-rds-data';
import { UnsupportedFieldType, isJsonFieldSchema } from '@ez4/pgclient';
import { isDate, isDateTime, isTime, isUUID } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';

export const prepareFieldData = (name: string, value: unknown, schema: AnySchema): SqlParameter => {
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

export const detectFieldData = (name: string, value: unknown): SqlParameter => {
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

const getBooleanFieldData = (name: string, value: boolean): SqlParameter => {
  return {
    name,
    value: {
      booleanValue: value
    }
  };
};

const getIntegerFieldData = (name: string, value: number): SqlParameter => {
  return {
    name,
    value: {
      longValue: value
    }
  };
};

const getDecimalFieldData = (name: string, value: number): SqlParameter => {
  return {
    name,
    value: {
      doubleValue: value
    }
  };
};

const getTextFieldData = (name: string, value: string): SqlParameter => {
  return {
    name,
    value: {
      stringValue: value
    }
  };
};

const getUuidFieldData = (name: string, value: string): SqlParameter => {
  return {
    typeHint: TypeHint.UUID,
    ...getTextFieldData(name, value)
  };
};

const getDateFieldData = (name: string, value: string): SqlParameter => {
  const date = value.substring(0, 10);

  return {
    typeHint: TypeHint.DATE,
    ...getTextFieldData(name, date)
  };
};

const getTimeFieldData = (name: string, value: string): SqlParameter => {
  const time = value.substring(0, 8);

  return {
    typeHint: TypeHint.TIME,
    ...getTextFieldData(name, time)
  };
};

const getDateTimeFieldData = (name: string, value: string): SqlParameter => {
  const timestamp = new Date(value).toISOString().substring(0, 19);

  const isoDate = timestamp.substring(0, 10);
  const isoTime = timestamp.substring(11, 19);

  return {
    typeHint: TypeHint.TIMESTAMP,
    ...getTextFieldData(name, `${isoDate} ${isoTime}`)
  };
};

const getJsonFieldData = (name: string, value: unknown): SqlParameter => {
  return {
    typeHint: TypeHint.JSON,
    ...getTextFieldData(name, JSON.stringify(value))
  };
};

const getNullFieldData = (name: string): SqlParameter => {
  return {
    name,
    value: {
      isNull: true
    }
  };
};

const getNumberFieldData = (name: string, value: number, format?: string): SqlParameter => {
  if (format === 'integer') {
    return getIntegerFieldData(name, value);
  }

  return getDecimalFieldData(name, value);
};

const getStringFieldData = (name: string, value: string, format?: string): SqlParameter => {
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
