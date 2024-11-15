import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema } from '@ez4/schema';

import { TypeHint } from '@aws-sdk/client-rds-data';
import { isDate, isDateTime, isTime, isUUID } from '@ez4/utils';
import { SchemaTypeName } from '@ez4/schema';

export const prepareFieldData = (name: string, value: unknown, schema: AnySchema): SqlParameter => {
  if (value === null) {
    return prepareNullField(name);
  }

  switch (schema.type) {
    case SchemaTypeName.Boolean:
      return prepareBooleanField(name, value as boolean);

    case SchemaTypeName.Number:
      return prepareNumberField(name, value as number, schema.format);

    case SchemaTypeName.String:
      return prepareStringField(name, value as string, schema.format);

    case SchemaTypeName.Object:
    case SchemaTypeName.Union:
    case SchemaTypeName.Array:
    case SchemaTypeName.Tuple:
      return prepareJsonField(name, value as object);

    default:
      return prepareTextField(name, value as string);
  }
};

export const detectFieldData = (name: string, value: unknown): SqlParameter => {
  switch (typeof value) {
    case 'boolean': {
      return prepareBooleanField(name, value);
    }

    case 'number': {
      if (Number.isSafeInteger(value)) {
        return prepareIntegerField(name, value);
      }

      return prepareDecimalField(name, value);
    }

    case 'string': {
      if (isDateTime(value)) {
        return prepareDateTimeField(name, value);
      }

      if (isDate(value)) {
        return prepareDateField(name, value);
      }

      if (isTime(value)) {
        return prepareTimeField(name, value);
      }

      if (isUUID(value)) {
        return prepareUUIDField(name, value);
      }

      return prepareTextField(name, value);
    }

    case 'object': {
      if (value instanceof Date) {
        return prepareDateTimeField(name, value.toISOString());
      }

      if (value !== null) {
        return prepareJsonField(name, value);
      }

      return prepareNullField(name);
    }

    default:
      throw new Error(`Field type isn't supported.`);
  }
};

const prepareBooleanField = (name: string, value: boolean): SqlParameter => {
  return {
    name,
    value: {
      booleanValue: value
    }
  };
};

const prepareNumberField = (name: string, value: number, format?: string): SqlParameter => {
  if (format === 'decimal') {
    return prepareDecimalField(name, value);
  }

  return prepareIntegerField(name, value);
};

const prepareIntegerField = (name: string, value: number): SqlParameter => {
  return {
    name,
    value: {
      longValue: value
    }
  };
};

const prepareDecimalField = (name: string, value: number): SqlParameter => {
  return {
    name,
    value: {
      doubleValue: value
    }
  };
};

const prepareStringField = (name: string, value: string, format?: string): SqlParameter => {
  switch (format) {
    case 'uuid':
      return prepareUUIDField(name, value);

    case 'time':
      return prepareTimeField(name, value);

    case 'date':
      return prepareDateField(name, value);

    case 'date-time':
      return prepareDateTimeField(name, value);

    default:
      return prepareTextField(name, value);
  }
};

const prepareTextField = (name: string, value: string): SqlParameter => {
  return {
    name,
    value: {
      stringValue: value
    }
  };
};

const prepareUUIDField = (name: string, value: string): SqlParameter => {
  return {
    typeHint: TypeHint.UUID,
    ...prepareTextField(name, value)
  };
};

const prepareDateField = (name: string, value: string): SqlParameter => {
  return {
    typeHint: TypeHint.DATE,
    ...prepareTextField(name, value)
  };
};

const prepareTimeField = (name: string, value: string): SqlParameter => {
  return {
    typeHint: TypeHint.TIME,
    ...prepareTextField(name, value)
  };
};

const prepareDateTimeField = (name: string, value: string): SqlParameter => {
  const date = value.substring(0, 10);
  const time = value.substring(11, 23);

  return {
    typeHint: TypeHint.TIMESTAMP,
    ...prepareTextField(name, `${date} ${time}`)
  };
};

const prepareJsonField = (name: string, value: object): SqlParameter => {
  return {
    name,
    typeHint: TypeHint.JSON,
    ...prepareTextField(name, JSON.stringify(value))
  };
};

const prepareNullField = (name: string): SqlParameter => {
  return {
    name,
    value: {
      isNull: true
    }
  };
};
