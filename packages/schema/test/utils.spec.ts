import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import {
  ObjectSchema,
  getPartialSchema,
  getPartialSchemaProperties,
  SchemaType
} from '@ez4/schema';

describe.only('schema utils', () => {
  const fullSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      foo: {
        type: SchemaType.String
      },
      bar: {
        type: SchemaType.Number
      },
      baz: {
        type: SchemaType.Object,
        properties: {
          bazFoo: {
            type: SchemaType.Boolean
          },
          bazBar: {
            type: SchemaType.String
          }
        }
      }
    }
  };

  it('assert :: partial schema (include)', () => {
    const partialSchema = getPartialSchema(fullSchema, {
      extensible: true,
      include: {
        bar: true,
        baz: {
          bazBar: true
        }
      }
    });

    deepEqual(partialSchema, {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        bar: {
          type: SchemaType.Number
        },
        baz: {
          type: SchemaType.Object,
          definitions: {
            extensible: true
          },
          properties: {
            bazBar: {
              type: SchemaType.String
            }
          }
        }
      }
    });
  });

  it('assert :: partial schema (exclude)', () => {
    const partialSchema = getPartialSchema(fullSchema, {
      exclude: {
        bar: true,
        baz: {
          bazBar: true
        }
      }
    });

    deepEqual(partialSchema, {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.String
        },
        baz: {
          type: SchemaType.Object,
          properties: {
            bazFoo: {
              type: SchemaType.Boolean
            }
          }
        }
      }
    });
  });

  it('assert :: partial schema (properties)', () => {
    const partialProperties = getPartialSchemaProperties(fullSchema);

    deepEqual(partialProperties, {
      foo: true,
      bar: true,
      baz: {
        bazFoo: true,
        bazBar: true
      }
    });
  });
});
