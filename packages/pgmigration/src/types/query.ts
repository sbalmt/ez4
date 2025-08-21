export type PgMigrationStatement = {
  check?: string;
  query: string;
};

export type PgMigrationQueries = {
  tables: PgMigrationStatement[];
  constraints: PgMigrationStatement[];
  relations: PgMigrationStatement[];
  indexes: PgMigrationStatement[];
};
