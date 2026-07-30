import type { Query, TableMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

export namespace InsertSchemaScalarTests {
  export type PrepareQuery<T extends TableMetadata> = <S extends Query.SelectInput<T>>(
    schema: ObjectSchema,
    query: Query.InsertOneInput<S, T>
  ) => Promise<[string, unknown[]]>;

  export const prepareBooleanColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          true: {
            type: SchemaType.Boolean
          },
          false: {
            type: SchemaType.Boolean
          }
        }
      },
      {
        data: {
          true: true,
          false: false
        } as any
      }
    );
  };

  export const prepareNumberColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          number: {
            type: SchemaType.Number
          }
        }
      },
      {
        data: {
          number: 123
        } as any
      }
    );
  };

  export const prepareStringColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          string: {
            type: SchemaType.String
          }
        }
      },
      {
        data: {
          string: 'foo'
        } as any
      }
    );
  };

  export const prepareNullableColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          nullable: {
            type: SchemaType.Number,
            nullable: true
          }
        }
      },
      {
        data: {
          nullable: null
        } as any
      }
    );
  };

  export const prepareOptionalColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          optional: {
            type: SchemaType.Number,
            optional: true
          }
        }
      },
      {
        data: {
          optional: undefined
        } as any
      }
    );
  };

  export const prepareUndefinedColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          required: {
            type: SchemaType.String
          },
          optional: {
            type: SchemaType.Number,
            optional: true
          }
        }
      },
      {
        data: {
          required: undefined,
          optional: undefined
        } as any
      }
    );
  };

  export const prepareUnexpectedColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number
          }
        }
      },
      {
        data: {
          foo: 123,
          bar: 'extra'
        } as any
      }
    );
  };

  export const prepareInvalidColumn = async <T extends TableMetadata>(prepareQuery: PrepareQuery<T>) => {
    return prepareQuery(
      {
        type: SchemaType.Object,
        properties: {
          column: {
            type: SchemaType.String
          }
        }
      },
      {
        data: {
          // The `column` can't be numeric as per schema definition.
          column: 123
        } as any
      }
    );
  };
}
