export type PgMigrationQuery = {
  check?: string;
  query: string;
};

export type PgMigrationQueries = {
  tables: PgMigrationQuery[];
  relations: PgMigrationQuery[];
  indexes: PgMigrationQuery[];
};
