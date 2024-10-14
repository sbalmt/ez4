import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { AnySchema } from '@ez4/schema';

import { SchemaTypeName } from '@ez4/schema';

export const prepareFieldData = (value: any, schema: AnySchema): SqlParameter => {
  if (value === null) {
    return prepareNullField();
  }

  switch (schema.type) {
    case SchemaTypeName.Boolean:
      return prepareBooleanField(value);

    case SchemaTypeName.Number:
      return prepareNumberField(value, schema.format);

    case SchemaTypeName.String:
      return prepareStringField(value, schema.format);

    case SchemaTypeName.Object:
    case SchemaTypeName.Union:
    case SchemaTypeName.Array:
    case SchemaTypeName.Tuple:
      return prepareJsonField(value);

    default:
      return prepareTextField(value);
  }
};

const prepareBooleanField = (value: boolean): SqlParameter => {
  return {
    value: {
      booleanValue: value
    }
  };
};

const prepareNumberField = (value: number, format?: string): SqlParameter => {
  if (format === 'decimal') {
    return {
      value: {
        doubleValue: value
      }
    };
  }

  return {
    value: {
      longValue: value
    }
  };
};

const prepareStringField = (value: string, format?: string): SqlParameter => {
  switch (format) {
    case 'uuid':
      return {
        typeHint: 'UUID',
        ...prepareTextField(value)
      };

    case 'time':
      return {
        typeHint: 'TIME',
        ...prepareTextField(value)
      };

    case 'date':
      return {
        typeHint: 'DATE',
        ...prepareTextField(value)
      };

    case 'date-time':
      return {
        typeHint: 'TIMESTAMP',
        ...prepareTextField(value)
      };

    default:
      return prepareTextField(value);
  }
};

const prepareJsonField = (value: any): SqlParameter => {
  return {
    typeHint: 'JSON',
    ...prepareTextField(JSON.stringify(value))
  };
};

const prepareTextField = (value: string): SqlParameter => {
  return {
    value: {
      stringValue: value
    }
  };
};

const prepareNullField = (): SqlParameter => {
  return {
    value: {
      isNull: true
    }
  };
};
