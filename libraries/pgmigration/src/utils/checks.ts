import type { SqlBuilder, SqlFilters } from '@ez4/pgsql';

export const getCheckDatabaseExistsQuery = (builder: SqlBuilder, database: string) => {
  const [query] = builder
    .select()
    .rawColumn(1)
    .from('pg_database')
    .where({
      datname: builder.rawString(database)
    })
    .build();

  return query;
};

export const getCheckConstraintExistsQuery = (builder: SqlBuilder, name: string) => {
  const [query] = builder
    .select()
    .rawColumn(1)
    .from('pg_constraint')
    .where({
      conname: builder.rawString(name)
    })
    .build();

  return query;
};

export const getCheckColumnExistsQuery = (builder: SqlBuilder, table: string, column: string) => {
  const [query] = builder
    .select()
    .rawColumn(1)
    .where({
      NOT: {
        exists: builder
          .select()
          .from(builder.rawValue('information_schema.columns'))
          .rawColumn(1)
          .where({
            column_name: builder.rawString(column),
            table_name: builder.rawString(table)
          })
      }
    })
    .build();

  return query;
};

export const getCheckConstraintValidatedQuery = (builder: SqlBuilder, name: string) => {
  const [query] = builder
    .select()
    .rawColumn(1)
    .from('pg_constraint')
    .where({
      convalidated: builder.rawValue('true'),
      conname: builder.rawString(name)
    })
    .build();

  return query;
};

export const getCheckConstraintRecordsQuery = (builder: SqlBuilder, table: string, filters: SqlFilters) => {
  const [query] = builder
    .select()
    .rawColumn(1)
    .from(table)
    .where({
      NOT: filters
    })
    .take(1)
    .build();

  return query;
};

export const getCheckUniqueRecordsQuery = (builder: SqlBuilder, table: string, columns: string[]) => {
  const filters = columns.reduce<SqlFilters>((filters, column) => {
    filters[column] = { isNull: false };
    return filters;
  }, {});

  const [query] = builder
    .select()
    .rawColumn(1)
    .from(table)
    .where(filters)
    .group(...columns)
    .having({
      '*': {
        count: true,
        gt: builder.rawValue('1')
      }
    })
    .take(1)
    .build();

  return query;
};
