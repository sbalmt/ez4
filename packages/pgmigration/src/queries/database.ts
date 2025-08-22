import { SqlBuilder } from '@ez4/pgsql';

import { getCheckDatabaseQuery } from '../utils/checks.js';

export namespace DatabaseQueries {
  export const prepareCreate = (database: string) => {
    const builder = new SqlBuilder();

    return {
      check: getCheckDatabaseQuery(builder, database),
      query: `CREATE DATABASE "${database}"`
    };
  };

  export const prepareDelete = (database: string) => {
    return {
      query: `DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`
    };
  };
}
