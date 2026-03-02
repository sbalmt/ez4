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

export const getCheckConstraintValidationQuery = (builder: SqlBuilder, name: string) => {
  const [query] = builder
    .select()
    .rawColumn('1')
    .from('pg_constraint')
    .where({
      convalidated: builder.rawValue('true'),
      conname: builder.rawString(name)
    })
    .build();

  return query;
};

export const getCheckIndexValidationQuery = (builder: SqlBuilder, name: string) => {
  const [query] = builder
    .select()
    .rawColumn('1')
    .from('pg_index')
    .where({
      indexrelid: builder.rawValue(`${builder.rawString(name).build()}::regclass`),
      indisvalid: builder.rawValue('true'),
      indisready: builder.rawValue('true')
    })
    .build();

  return query;
};

export const getCheckColumnQuery = (builder: SqlBuilder, table: string, column: string) => {
  const [query] = builder
    .select()
    .rawColumn('1')
    .where({
      NOT: {
        exists: builder
          .select()
          .from(builder.rawValue('information_schema.columns'))
          .rawColumn('1')
          .where({
            column_name: builder.rawString(column),
            table_name: builder.rawString(table)
          })
      }
    })
    .build();

  return query;
};

export const getCheckIndexIntegrityQuery = (builder: SqlBuilder, name: string) => {
  const [query] = builder
    .select()
    .rawColumn('1')
    .from('pg_index')
    .where({
      indexrelid: builder.rawValue(`${builder.rawString(name).build()}::regclass`),
      indisvalid: builder.rawValue('false'),
      indisready: builder.rawValue('true')
    })
    .build();

  return query;
};
