import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/aws-aurora/client';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Index } from '@ez4/database';

type TestSchema = {
  id: string;
  foo?: number;
  relation1_id?: string;
  relation2_id?: string;
  bar: {
    barFoo?: string;
    barBar?: boolean;
  };
};

type TestRelations = {
  relation1?: TestSchema;
  relation2?: TestSchema;
};

type TestIndexes = {
  id: Index.Primary;
};

describe.only('aurora query update', () => {
  const testSchema: ObjectSchema = {
    type: SchemaTypeName.Object,
    properties: {
      id: {
        type: SchemaTypeName.String,
        format: 'uuid'
      },
      relation1_id: {
        type: SchemaTypeName.String,
        format: 'uuid'
      },
      relation2_id: {
        type: SchemaTypeName.String,
        format: 'uuid'
      },
      foo: {
        type: SchemaTypeName.Number,
        optional: true
      },
      bar: {
        type: SchemaTypeName.Object,
        properties: {
          barFoo: {
            type: SchemaTypeName.String,
            optional: true
          },
          barBar: {
            type: SchemaTypeName.Boolean,
            optional: true
          }
        }
      }
    }
  };

  const testRelations = {
    relation1: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relation1',
      targetColumn: 'relation1_id',
      sourceColumn: 'id',
      foreign: false
    },
    relation2: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relation2',
      targetColumn: 'relation2_id',
      sourceColumn: 'id',
      foreign: false
    }
  };

  it.only('assert :: prepare update', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: 'new',
          foo: 456
        },
        where: {
          foo: 123
        }
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "id" = :0i, "foo" = :1i WHERE "foo" = :0`);

    deepEqual(variables, [
      {
        name: '0i',
        typeHint: 'UUID',
        value: {
          stringValue: 'new'
        }
      },
      {
        name: '1i',
        value: {
          longValue: 456
        }
      },
      {
        name: '0',
        value: {
          longValue: 123
        }
      }
    ]);
  });

  it.only('assert :: prepare update (with relationship)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: 'new',
          relation1: {
            foo: 123
          },
          relation2: {
            bar: {
              barFoo: 'test'
            }
          }
        },
        where: {
          foo: 456
        }
      }
    );

    equal(
      statement,
      `WITH ` +
        `R1 AS (UPDATE "ez4-test-update" SET "id" = :2i WHERE "foo" = :0 RETURNING "relation1_id", "relation2_id"), ` +
        `R2 AS (UPDATE "ez4-test-relation" SET "foo" = :0i FROM R1 WHERE "id" = R1."relation1_id" RETURNING R1.*) ` +
        `UPDATE "ez4-test-relation" SET "bar"['barFoo'] = :1i ` +
        `FROM R2 ` +
        `WHERE "id" = R2."relation2_id" ` +
        `RETURNING R2.*`
    );

    deepEqual(variables, [
      {
        name: '0i',
        value: {
          longValue: 123
        }
      },
      {
        name: '1i',
        value: {
          stringValue: 'test'
        }
      },
      {
        name: '2i',
        typeHint: 'UUID',
        value: {
          stringValue: 'new'
        }
      },
      {
        name: '0',
        value: {
          longValue: 456
        }
      }
    ]);
  });

  it.only('assert :: prepare update (with select)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        select: {
          foo: true,
          bar: {
            barBar: true
          }
        },
        data: {
          foo: 456,
          bar: {
            barBar: false
          }
        },
        where: {
          id: 'abc'
        }
      }
    );

    equal(
      statement,
      `UPDATE "ez4-test-update" ` +
        `SET "foo" = :0i, "bar"['barBar'] = :1i ` +
        `WHERE "id" = :0 ` +
        `RETURNING "foo", json_build_object('barBar', "bar"['barBar']) AS "bar"`
    );

    deepEqual(variables, [
      {
        name: '0i',
        value: {
          longValue: 456
        }
      },
      {
        name: '1i',
        value: {
          booleanValue: false
        }
      },
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });
});
