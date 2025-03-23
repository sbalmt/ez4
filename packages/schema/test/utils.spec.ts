import type { ArraySchema, ObjectSchema, TupleSchema, UnionSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import {
  getPartialSchema,
  getObjectSchemaProperties,
  getUnionSchemaProperties,
  getArraySchemaProperties,
  getTupleSchemaProperties,
  SchemaType
} from '@ez4/schema';

describe('schema utils', () => {
  const fullSchema: ObjectSchema = {
    type: SchemaType.Object,
    identity: 1,
    properties: {
      foo: {
        type: SchemaType.String
      },
      bar: {
        type: SchemaType.Number
      },
      baz: {
        type: SchemaType.Object,
        identity: 2,
        properties: {
          bazFoo: {
            type: SchemaType.Boolean
          },
          bazBar: {
            type: SchemaType.String
          }
        }
      },
      qux: {
        type: SchemaType.Object,
        identity: 3,
        properties: {},
        definitions: {
          extensible: true
        }
      },
      xyz: {
        type: SchemaType.Object,
        identity: 4,
        properties: {},
        additional: {
          property: {
            type: SchemaType.Number
          },
          value: {
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
      identity: 1,
      definitions: {
        extensible: true
      },
      properties: {
        bar: {
          type: SchemaType.Number
        },
        baz: {
          type: SchemaType.Object,
          identity: 2,
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
        },
        qux: true,
        xyz: true
      }
    });

    deepEqual(partialSchema, {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.String
        },
        baz: {
          type: SchemaType.Object,
          identity: 2,
          properties: {
            bazFoo: {
              type: SchemaType.Boolean
            }
          }
        }
      }
    });
  });

  it('assert :: object schema properties', () => {
    const schemaProperties = getObjectSchemaProperties(fullSchema);

    deepEqual(schemaProperties, {
      foo: true,
      bar: true,
      baz: {
        bazFoo: true,
        bazBar: true
      },
      qux: true,
      xyz: true
    });
  });

  it('assert :: union schema properties', () => {
    const unionSchema: UnionSchema = {
      type: SchemaType.Union,
      elements: [
        fullSchema,
        {
          type: SchemaType.Object,
          properties: {
            abc: {
              type: SchemaType.String
            }
          }
        }
      ]
    };

    const schemaProperties = getUnionSchemaProperties(unionSchema);

    deepEqual(schemaProperties, {
      foo: true,
      bar: true,
      baz: {
        bazFoo: true,
        bazBar: true
      },
      qux: true,
      xyz: true,
      abc: true // New property
    });
  });

  it('assert :: array schema properties', () => {
    const arraySchema: ArraySchema = {
      type: SchemaType.Array,
      element: fullSchema
    };

    const schemaProperties = getArraySchemaProperties(arraySchema);

    deepEqual(schemaProperties, {
      foo: true,
      bar: true,
      baz: {
        bazFoo: true,
        bazBar: true
      },
      qux: true,
      xyz: true
    });
  });

  it('assert :: tuple schema properties', () => {
    const tupleSchema: TupleSchema = {
      type: SchemaType.Tuple,
      elements: [
        fullSchema,
        {
          type: SchemaType.Object,
          properties: {
            abc: {
              type: SchemaType.String
            }
          }
        }
      ]
    };

    const schemaProperties = getTupleSchemaProperties(tupleSchema);

    deepEqual(schemaProperties, {
      foo: true,
      bar: true,
      baz: {
        bazFoo: true,
        bazBar: true
      },
      qux: true,
      xyz: true,
      abc: true // New property
    });
  });
});
