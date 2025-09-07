import type { ObjectSchema, String } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

export type TestSchemaType = {
  id: string;
  integer?: number;
  decimal?: number;
  boolean?: boolean;
  string?: string | null;
  datetime?: String.DateTime;
  date?: String.Date;
  time?: String.Time;
  json?: {
    string?: string;
    boolean?: boolean;
    number?: number | null;
    datetime?: String.DateTime;
    array?: number[];
  };
};

export const TestSchema: ObjectSchema = {
  type: SchemaType.Object,
  properties: {
    id: {
      type: SchemaType.String,
      format: 'uuid'
    },
    integer: {
      type: SchemaType.Number,
      format: 'integer',
      optional: true,
      nullable: true
    },
    decimal: {
      type: SchemaType.Number,
      format: 'decimal',
      optional: true,
      nullable: true
    },
    boolean: {
      type: SchemaType.Boolean,
      optional: true,
      nullable: true
    },
    string: {
      type: SchemaType.String,
      optional: true,
      nullable: true
    },
    datetime: {
      type: SchemaType.String,
      format: 'date-time',
      optional: true,
      nullable: true
    },
    date: {
      type: SchemaType.String,
      format: 'date',
      optional: true,
      nullable: true
    },
    time: {
      type: SchemaType.String,
      format: 'time',
      optional: true,
      nullable: true
    },
    json: {
      type: SchemaType.Object,
      optional: true,
      nullable: true,
      properties: {
        string: {
          type: SchemaType.String,
          optional: true,
          nullable: true
        },
        boolean: {
          type: SchemaType.Boolean,
          optional: true,
          nullable: true
        },
        number: {
          type: SchemaType.Number,
          optional: true,
          nullable: true
        },
        datetime: {
          type: SchemaType.String,
          format: 'date-time',
          optional: true,
          nullable: true
        },
        array: {
          type: SchemaType.Array,
          optional: true,
          nullable: true,
          element: {
            type: SchemaType.Number
          }
        }
      }
    }
  }
};
