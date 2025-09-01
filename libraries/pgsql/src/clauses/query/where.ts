import { SqlConditions } from '../../operations/conditions';

export class SqlWhereClause extends SqlConditions {
  build(): [string, unknown[]] | undefined {
    const result = super.build();

    if (result) {
      const [clause, variables] = result;

      return [`WHERE ${clause}`, variables];
    }

    return undefined;
  }
}
