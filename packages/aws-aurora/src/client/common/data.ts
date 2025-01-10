import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema } from '@ez4/schema';

import { TypeHint } from '@aws-sdk/client-rds-data';
import { isDate, isDateTime, isTime, isUUID } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';

export const isSkippableData = (value: unknown) => {
  return value === undefined;
};

export const prepareFieldData = (name: string, value: unknown, schema: AnySchema): SqlParameter => {
  if (value === null) {
    return getNullField(name);
  }

  switch (schema.type) {
    case SchemaType.Boolean:
      return getBooleanField(name, value as boolean);

    case SchemaType.Number:
      return getNumberField(name, value as number, schema.format);

    case SchemaType.String:
      return getStringField(name, value as string, schema.format);

    case SchemaType.Object:
    case SchemaType.Union:
    case SchemaType.Array:
    case SchemaType.Tuple:
      return getJsonField(name, value as object);

    default:
      return getTextField(name, value as string);
  }
};

export const detectFieldData = (name: string, value: unknown): SqlParameter => {
  switch (typeof value) {
    case 'boolean': {
      return getBooleanField(name, value);
    }

    case 'number': {
      if (Number.isSafeInteger(value)) {
        return getIntegerField(name, value);
      }

      return getDecimalField(name, value);
    }

    case 'string': {
      if (isDateTime(value)) {
        return getDateTimeField(name, value);
      }

      if (isDate(value)) {
        return getDateField(name, value);
      }

      if (isTime(value)) {
        return getTimeField(name, value);
      }

      if (isUUID(value)) {
        return getUUIDField(name, value);
      }

      return getTextField(name, value);
    }

    case 'object': {
      if (value instanceof Date) {
        return getDateTimeField(name, value.toISOString());
      }

      if (value !== null) {
        return getJsonField(name, value);
      }

      return getNullField(name);
    }

    default:
      throw new Error(`Field type isn't supported.`);
  }
};

const getBooleanField = (name: string, value: boolean): SqlParameter => {
  return {
    name,
    value: {
      booleanValue: value
    }
  };
};

const getNumberField = (name: string, value: number, format?: string): SqlParameter => {
  if (format === 'decimal') {
    return getDecimalField(name, value);
  }

  return getIntegerField(name, value);
};

const getIntegerField = (name: string, value: number): SqlParameter => {
  return {
    name,
    value: {
      longValue: value
    }
  };
};

const getDecimalField = (name: string, value: number): SqlParameter => {
  return {
    name,
    value: {
      doubleValue: value
    }
  };
};

const getStringField = (name: string, value: string, format?: string): SqlParameter => {
  switch (format) {
    case 'uuid':
      return getUUIDField(name, value);

    case 'time':
      return getTimeField(name, value);

    case 'date':
      return getDateField(name, value);

    case 'date-time':
      return getDateTimeField(name, value);

    default:
      return getTextField(name, value);
  }
};

const getTextField = (name: string, value: string): SqlParameter => {
  return {
    name,
    value: {
      stringValue: value
    }
  };
};

const getUUIDField = (name: string, value: string): SqlParameter => {
  return {
    typeHint: TypeHint.UUID,
    ...getTextField(name, value)
  };
};

const getDateField = (name: string, value: string): SqlParameter => {
  return {
    typeHint: TypeHint.DATE,
    ...getTextField(name, value)
  };
};

const getTimeField = (name: string, value: string): SqlParameter => {
  return {
    typeHint: TypeHint.TIME,
    ...getTextField(name, value)
  };
};

const getDateTimeField = (name: string, value: string): SqlParameter => {
  const date = value.substring(0, 10);
  const time = value.substring(11, 23);

  return {
    typeHint: TypeHint.TIMESTAMP,
    ...getTextField(name, `${date} ${time}`)
  };
};

const getJsonField = (name: string, value: object): SqlParameter => {
  return {
    name,
    typeHint: TypeHint.JSON,
    ...getTextField(name, JSON.stringify(value))
  };
};

const getNullField = (name: string): SqlParameter => {
  return {
    name,
    value: {
      isNull: true
    }
  };
};
