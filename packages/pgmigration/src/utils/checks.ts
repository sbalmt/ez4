import type { SqlBuilder } from '@ez4/pgsql';

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
    .rawColumn('1')
    .from('information_schema.columns')
    .where({
      column_name: builder.rawString(column),
      table_name: builder.rawString(table)
    })
    .build();

  return query;
};
