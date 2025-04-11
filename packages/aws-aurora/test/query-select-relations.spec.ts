import type { RepositoryRelationsWithSchema } from '@ez4/aws-aurora';
import type { Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestSchema = {
  id: string;
  foo?: number;
  relation1_id?: string;
  relation2_id?: string;
};

type TestRelations = {
  indexes: 'relation1_id' | 'relation2_id';
  filters: {
    primary_to_secondary: TestSchema;
    unique_to_primary: TestSchema;
    secondary_to_primary: TestSchema;
  };
  selects: {
    primary_to_secondary?: TestSchema;
    unique_to_primary?: TestSchema;
    secondary_to_primary?: TestSchema[];
  };
  changes: {
    primary_to_secondary?: TestSchema | { relation1_id: string };
    unique_to_primary?: TestSchema | { relation2_id: string };
    secondary_to_primary?: TestSchema[];
  };
};

type TestIndexes = {
  id: Index.Primary;
  relation1_id: Index.Secondary;
  relation2_id: Index.Secondary;
};

describe('aurora query (select relations)', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
      },
      relation1_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      },
      relation2_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      },
      foo: {
        type: SchemaType.Number,
        optional: true
      }
    }
  };

  const testRelations: RepositoryRelationsWithSchema = {
    primary_to_secondary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'relation1_id',
      sourceColumn: 'id',
      sourceIndex: Index.Primary,
      targetIndex: Index.Secondary
    },
    unique_to_primary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'id',
      sourceColumn: 'relation2_id',
      sourceIndex: Index.Unique,
      targetIndex: Index.Primary
    },
    secondary_to_primary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'id',
      sourceColumn: 'relation1_id',
      sourceIndex: Index.Secondary,
      targetIndex: Index.Primary
    }
  };

  const prepareSelect = <S extends Query.SelectInput<TestSchema, TestRelations>>(
    query: Query.FindOneInput<TestSchema, S, {}, TestRelations>
  ) => {
    return prepareSelectQuery<TestSchema, S, TestIndexes, TestRelations, false>(
      'ez4-test-select-relations',
      testSchema,
      testRelations,
      query
    );
  };

  it('assert :: prepare select relations', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        foo: true,
        primary_to_secondary: {
          id: true
        },
        unique_to_primary: true,
        secondary_to_primary: {
          foo: true
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", "R"."foo", ` +
        // First relation
        `(SELECT json_build_object('id', "T"."id") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "primary_to_secondary", ` +
        // Second relation
        `(SELECT json_build_object(` +
        `'id', "T"."id", ` +
        `'relation1_id', "T"."relation1_id", ` +
        `'relation2_id', "T"."relation2_id", ` +
        `'foo', "T"."foo") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "unique_to_primary", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R"."id") AS "secondary_to_primary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :0`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });

  it('assert :: prepare select relations (with filters)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        foo: true,
        primary_to_secondary: {
          foo: true
        },
        unique_to_primary: {
          foo: true
        },
        secondary_to_primary: {
          foo: true
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          foo: 123
        },
        unique_to_primary: {
          foo: 456
        },
        secondary_to_primary: {
          id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", "R"."foo", ` +
        // First relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "primary_to_secondary", ` +
        // Second relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "unique_to_primary", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R"."id") AS "secondary_to_primary" ` +
        // Main condition
        `FROM "ez4-test-select-relations" AS "R" WHERE "R"."id" = :0 AND ` +
        // First relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."foo" = :1 AND "T"."id" = "R"."relation1_id") AND ` +
        // Second relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."foo" = :2 AND "T"."relation2_id" = "R"."id") AND ` +
        // Third relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."id" = :3 AND "T"."relation1_id" = "R"."id")`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 123),
      makeParameter('2', 456),
      makeParameter('3', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare select (with relationship connections)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {},
        unique_to_primary: null,
        NOT: {
          secondary_to_primary: null
        }
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id" FROM "ez4-test-select-relations" AS "R" WHERE "R"."id" = :0 AND ` +
        // First relation
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AND ` +
        // Second relation
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" != "R"."id") AND ` +
        // Third relation
        `NOT EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" != "R"."id")`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });

  it('assert :: prepare select relations (with includes)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        primary_to_secondary: {
          foo: true
        },
        unique_to_primary: {
          foo: true
        },
        secondary_to_primary: {
          foo: true
        }
      },
      include: {
        primary_to_secondary: {},
        unique_to_primary: null,
        secondary_to_primary: {
          foo: 123
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", ` +
        // First relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "primary_to_secondary", ` +
        // Second relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "unique_to_primary", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."foo" = :0 AND "T"."relation1_id" = "R"."id") AS "secondary_to_primary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :1`
    );

    assert.deepEqual(variables, [makeParameter('0', 123), makeParameter('1', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });
});
