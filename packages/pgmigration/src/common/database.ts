import { SqlBuilder } from '@ez4/pgsql';

import { getCheckDatabaseQuery } from '../utils/checks.js';

export const prepareCreateDatabase = (database: string) => {
  const builder = new SqlBuilder();

  return {
    check: getCheckDatabaseQuery(builder, database),
    query: `CREATE DATABASE "${database}"`
  };
};

export const prepareDeleteDatabase = (database: string) => {
  return {
    query: `DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`
  };
};
