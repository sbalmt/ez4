import type { SqlResults } from './results.js';

import { SqlColumnReference } from './reference.js';

export type SqlStatementWithResults = SqlStatement & {
  readonly results: SqlResults;
};

export abstract class SqlStatement {
  abstract readonly alias: string | undefined;

  abstract readonly results: SqlResults | undefined;

  reference(column: string) {
    return new SqlColumnReference({
      statement: this,
      name: column
    });
  }
}
