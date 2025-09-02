import type { PostgresEngine } from '@ez4/pgclient/library';
import type { RelationMetadata, Index, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareDeleteQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {
    id: Index.Primary;
  };
  schema: {
    id: string;
    foo?: number;
    bar?: boolean;
  };
};

describe('delete query', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
      },
      foo: {
        type: SchemaType.Number,
        optional: true
      },
      bar: {
        type: SchemaType.Boolean,
        optional: true
      }
    }
  };

  const prepareDelete = <S extends Query.SelectInput<TestTableMetadata>>(query: Query.DeleteOneInput<S, TestTableMetadata>) => {
    const builder = new SqlBuilder();

    const deleteQuery = prepareDeleteQuery(builder, 'ez4-test-delete', testSchema, {}, query);

    return deleteQuery.build();
  };

  it('assert :: prepare delete', () => {
    const [statement, variables] = prepareDelete({
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0`);

    deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDelete({
      select: {
        id: true,
        foo: true,
        bar: true
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0 RETURNING "id", "foo", "bar"`);

    deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });
});
