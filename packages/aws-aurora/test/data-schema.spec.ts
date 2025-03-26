import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';

import { getInsertSchema, getUpdateSchema, validateAllSchemaLevels } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('aurora data schema', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
      },
      parent_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      },
      sibling_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      }
    }
  };

  const testRelations = {
    parent: {
      sourceAlias: 'parent',
      sourceColumn: 'id',
      sourceSchema: testSchema,
      sourceTable: 'test',
      targetColumn: 'parent_id',
      sourceIndex: Index.Primary,
      targetIndex: Index.Secondary
    },
    sibling: {
      sourceAlias: 'sibling',
      sourceColumn: 'sibling_id',
      sourceSchema: testSchema,
      sourceTable: 'test',
      targetColumn: 'id',
      sourceIndex: Index.Unique,
      targetIndex: Index.Primary
    },
    children: {
      sourceAlias: 'children',
      sourceColumn: 'parent_id',
      sourceSchema: testSchema,
      sourceTable: 'test',
      targetColumn: 'id',
      sourceIndex: Index.Secondary,
      targetIndex: Index.Primary
    }
  };

  it('assert :: insert related schema (primary foreign id)', async () => {
    const data = {
      id: '00000000-0000-1000-8000-000000000000',
      parent: {
        parent_id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = getInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        id: testSchema.properties.id,
        sibling_id: testSchema.properties.sibling_id,
        parent: {
          type: SchemaType.Object,
          properties: {
            parent_id: testSchema.properties.parent_id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: insert related schema (primary foreign object)', async () => {
    const data = {
      id: '00000000-0000-1000-9000-000000000000',
      parent: {
        id: '00000000-0000-1000-9000-000000000001'
      }
    };

    const schema = getInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        id: testSchema.properties.id,
        sibling_id: testSchema.properties.sibling_id,
        parent: {
          ...testSchema
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: insert related schema (unique foreign id)', async () => {
    const data = {
      id: '00000000-0000-1000-8000-000000000000',
      sibling: {
        sibling_id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = getInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        id: testSchema.properties.id,
        parent_id: testSchema.properties.parent_id,
        sibling: {
          type: SchemaType.Object,
          properties: {
            sibling_id: testSchema.properties.sibling_id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: insert related schema (unique foreign object)', async () => {
    const data = {
      id: '00000000-0000-1000-8000-000000000000',
      sibling: {
        id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = getInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        id: testSchema.properties.id,
        parent_id: testSchema.properties.parent_id,
        sibling: {
          type: SchemaType.Object,
          properties: {
            id: testSchema.properties.id,
            parent_id: testSchema.properties.parent_id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: insert related schema (inverse array object)', async () => {
    const data = {
      id: '00000000-0000-1000-9000-000000000000',
      children: [
        {
          id: '00000000-0000-1000-9000-000000000001'
        },
        {
          id: '00000000-0000-1000-9000-000000000002'
        }
      ]
    };

    const schema = getInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        ...testSchema.properties,
        children: {
          type: SchemaType.Array,
          element: {
            type: SchemaType.Object,
            properties: {
              id: testSchema.properties.id,
              sibling_id: testSchema.properties.sibling_id
            }
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: update related schema (primary foreign id)', async () => {
    const data = {
      id: undefined,
      parent: {
        parent_id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = getUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        parent: {
          type: SchemaType.Object,
          definitions: {
            extensible: true
          },
          properties: {
            parent_id: testSchema.properties.parent_id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: update related schema (primary foreign object)', async () => {
    const data = {
      id: undefined,
      parent: {
        id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = getUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        parent: {
          type: SchemaType.Object,
          definitions: {
            extensible: true
          },
          properties: {
            id: testSchema.properties.id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: update related schema (unique foreign id)', async () => {
    const data = {
      id: undefined,
      sibling: {
        sibling_id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = getUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        sibling: {
          type: SchemaType.Object,
          definitions: {
            extensible: true
          },
          properties: {
            sibling_id: testSchema.properties.sibling_id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: update related schema (unique foreign object)', async () => {
    const data = {
      id: undefined,
      sibling: {
        id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = getUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        sibling: {
          type: SchemaType.Object,
          definitions: {
            extensible: true
          },
          properties: {
            id: testSchema.properties.id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });

  it('assert :: update related schema (inverse array object)', async () => {
    const data = {
      id: undefined,
      children: {
        id: '00000000-0000-1000-9000-000000000001'
      }
    };

    const schema = getUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        children: {
          type: SchemaType.Object,
          definitions: {
            extensible: true
          },
          properties: {
            id: testSchema.properties.id
          }
        }
      }
    });

    await validateAllSchemaLevels(data, schema, 'table');
  });
});
