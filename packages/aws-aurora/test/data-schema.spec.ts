import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsertSchema, prepareUpdateSchema, validateSchema } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';

describe.only('aurora data schema', () => {
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
      }
    }
  };

  const testRelations = {
    parent: {
      foreign: true,
      sourceAlias: 'parent',
      sourceColumn: 'id',
      sourceSchema: testSchema,
      sourceTable: 'test',
      targetColumn: 'parent_id'
    },
    children: {
      foreign: false,
      sourceAlias: 'children',
      sourceColumn: 'parent_id',
      sourceSchema: testSchema,
      sourceTable: 'test',
      targetColumn: 'id'
    }
  };

  it('assert :: insert schema (foreign relationship id)', async () => {
    const data = {
      id: '00000000-0000-1000-8000-000000000000',
      parent: {
        parent_id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = prepareInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        id: testSchema.properties.id,
        parent: {
          type: SchemaType.Object,
          properties: {
            parent_id: testSchema.properties.parent_id
          }
        }
      }
    });

    await validateSchema(data, schema);
  });

  it('assert :: insert schema (foreign relationship object)', async () => {
    const data = {
      id: '00000000-0000-1000-9000-000000000000',
      parent: {
        id: '00000000-0000-1000-9000-000000000001'
      }
    };

    const schema = prepareInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        id: testSchema.properties.id,
        parent: {
          ...testSchema
        }
      }
    });

    await validateSchema(data, schema);
  });

  it('assert :: insert schema (inverse relationship array)', async () => {
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

    const schema = prepareInsertSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        ...testSchema.properties,
        children: {
          type: SchemaType.Array,
          element: {
            type: SchemaType.Object,
            properties: {
              id: testSchema.properties.id
            }
          }
        }
      }
    });

    await validateSchema(data, schema);
  });

  it('assert :: update schema (foreign relationship id)', async () => {
    const data = {
      parent: {
        parent_id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = prepareUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        parent: {
          type: SchemaType.Object,
          properties: {
            parent_id: testSchema.properties.parent_id
          }
        }
      }
    });

    await validateSchema(data, schema);
  });

  it('assert :: update schema (foreign relationship object)', async () => {
    const data = {
      parent: {
        id: '00000000-0000-1000-8000-000000000001'
      }
    };

    const schema = prepareUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        parent: {
          type: SchemaType.Object,
          properties: {
            id: testSchema.properties.id
          }
        }
      }
    });

    await validateSchema(data, schema);
  });

  it('assert :: update schema (inverse relationship object)', async () => {
    const data = {
      children: {
        id: '00000000-0000-1000-9000-000000000001'
      }
    };

    const schema = prepareUpdateSchema(testSchema, testRelations, data);

    deepEqual(schema, {
      type: SchemaType.Object,
      properties: {
        children: {
          type: SchemaType.Object,
          properties: {
            id: testSchema.properties.id
          }
        }
      }
    });

    await validateSchema(data, schema);
  });
});
