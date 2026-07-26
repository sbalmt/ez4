import type { ObjectSchema } from '@ez4/schema';
import type { SqlReferenceGenerator } from './reference';
import type { SqlResults } from './results';

import { SqlColumnReference, SqlTableReference } from './reference';

type ReferenceReturnType<T> = undefined extends T ? SqlTableReference : SqlColumnReference;

export type SqlSourceWithResults = SqlSource & {
  readonly results: SqlResults;
};

export abstract class SqlSource {
  abstract readonly alias: string | undefined;

  abstract readonly results: SqlResults | undefined;

  abstract readonly schema: ObjectSchema | undefined;

  abstract readonly building: boolean;

  abstract as(alias: string | undefined): SqlSource;

  abstract build(): [string, unknown[]];

  reference<T extends string | SqlReferenceGenerator | undefined>(column?: T, alias?: string): ReferenceReturnType<T> {
    if (column) {
      return new SqlColumnReference(this, column, alias) as ReferenceReturnType<T>;
    }

    return new SqlTableReference(this) as ReferenceReturnType<T>;
  }
}
