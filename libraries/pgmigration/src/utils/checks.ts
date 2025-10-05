import type { SqlBuilder } from '@ez4/pgsql';

export const getCheckDatabaseQuery = (builder: SqlBuilder, database: string) => {
  const [query] = builder
    .select()
    .rawColumn('1')
    .from('pg_database')
    .where({
      datname: builder.rawString(database)
    })
    .build();

  return query;
};

export const getCheckConstraintQuery = (builder: SqlBuilder, name: string) => {
  const [query] = builder
    .select()
    .rawColumn('1')
    .from('pg_constraint')
    .where({
      conname: builder.rawString(name)
    })
    .build();

  return query;
};

export const getCheckColumnQuery = (builder: SqlBuilder, table: string, column: string) => {
  const [query] = builder
    .select()
    .from(builder.rawValue('information_schema.columns'))
    .rawColumn('1')
    .where({
      column_name: builder.rawString(column),
      table_name: builder.rawString(table)
    })
    .build();

  return query;
};
