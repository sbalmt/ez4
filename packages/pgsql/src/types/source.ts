import type { ObjectSchema } from '@ez4/schema';
import type { SqlReferenceGenerator } from './reference.js';
import type { SqlResults } from './results.js';

import { SqlReference } from './reference.js';

export type SqlSourceWithResults = SqlSource & {
  readonly results: SqlResults;
};

export abstract class SqlSource {
  abstract readonly alias: string | undefined;

  abstract readonly results: SqlResults | undefined;

  abstract readonly schema: ObjectSchema | undefined;

  abstract as(alias: string | undefined): SqlSource;

  abstract build(): [string, unknown[]];

  reference(column: string | SqlReferenceGenerator) {
    return new SqlReference(this, column);
  }
}
