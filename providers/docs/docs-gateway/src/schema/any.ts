import type { AnySchema, NamingStyle } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { getBooleanSchemaOutput } from './boolean';
import { getNumberSchemaOutput } from './number';
import { getStringSchemaOutput } from './string';
import { getObjectSchemaOutput } from './object';
import { getReferenceSchemaOutput } from './reference';
import { getUnionSchemaOutput } from './union';
import { getArraySchemaOutput } from './array';
import { getTupleSchemaOutput } from './tuple';
import { getEnumSchemaOutput } from './enum';

export const getAnySchemaOutput = (schema: AnySchema, namingStyle?: NamingStyle): string[] => {
  switch (schema.type) {
    case SchemaType.String:
      return getStringSchemaOutput(schema);

    case SchemaType.Number:
      return getNumberSchemaOutput(schema);

    case SchemaType.Boolean:
      return getBooleanSchemaOutput(schema);

    case SchemaType.Object:
      return getObjectSchemaOutput(schema, namingStyle);

    case SchemaType.Reference:
      return getReferenceSchemaOutput(schema);

    case SchemaType.Union:
      return getUnionSchemaOutput(schema, namingStyle);

    case SchemaType.Array:
      return getArraySchemaOutput(schema);

    case SchemaType.Tuple:
      return getTupleSchemaOutput(schema, namingStyle);

    case SchemaType.Enum:
      return getEnumSchemaOutput(schema);
  }
};
