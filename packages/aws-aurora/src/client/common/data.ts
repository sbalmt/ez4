import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema } from '@ez4/schema';

import { TypeHint } from '@aws-sdk/client-rds-data';
import { SchemaTypeName } from '@ez4/schema';

export const prepareFieldData = (name: string, value: any, schema: AnySchema): SqlParameter => {
  if (value === null) {
    return prepareNullField(name);
  }

  switch (schema.type) {
    case SchemaTypeName.Boolean:
      return prepareBooleanField(name, value);

    case SchemaTypeName.Number:
      return prepareNumberField(name, value, schema.format);

    case SchemaTypeName.String:
      return prepareStringField(name, value, schema.format);

    case SchemaTypeName.Object:
    case SchemaTypeName.Union:
    case SchemaTypeName.Array:
    case SchemaTypeName.Tuple:
      return prepareJsonField(name, value);

    default:
      return prepareTextField(name, value);
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
    return {
      name,
      value: {
        doubleValue: value
      }
    };
  }

  return {
    name,
    value: {
      longValue: value
    }
  };
};

const prepareStringField = (name: string, value: string, format?: string): SqlParameter => {
  switch (format) {
    case 'uuid':
      return {
        typeHint: TypeHint.UUID,
        ...prepareTextField(name, value)
      };

    case 'time':
      return {
        typeHint: TypeHint.TIME,
        ...prepareTextField(name, value)
      };

    case 'date':
      return {
        typeHint: TypeHint.DATE,
        ...prepareTextField(name, value)
      };

    case 'date-time': {
      const date = value.substring(0, 10);
      const time = value.substring(11, 23);

      return {
        typeHint: TypeHint.TIMESTAMP,
        ...prepareTextField(name, `${date} ${time}`)
      };
    }

    default:
      return prepareTextField(name, value);
  }
};

const prepareJsonField = (name: string, value: any): SqlParameter => {
  return {
    name,
    typeHint: TypeHint.JSON,
    ...prepareTextField(name, JSON.stringify(value))
  };
};

const prepareTextField = (name: string, value: string): SqlParameter => {
  return {
    name,
    value: {
      stringValue: value
    }
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
