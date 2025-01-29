import { SqlConditions } from './conditions.js';

export class SqlWhereClause extends SqlConditions {
  build(): [string, unknown[]] {
    const [clause, variables] = super.build();

    return [`WHERE ${clause}`, variables];
  }
}
