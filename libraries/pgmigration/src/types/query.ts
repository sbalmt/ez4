export type PgMigrationStatement = {
  name?: string;
  check?: string;
  assert?: string;
  query: string;
};

export type PgValidationStatement = {
  name: string;
  check: string;
  retry: string;
};

export type PgMigrationQueries = {
  tables: PgMigrationStatement[];
  constraints: PgMigrationStatement[];
  validations: PgValidationStatement[];
  relations: PgMigrationStatement[];
  indexes: PgMigrationStatement[];
};

export type PgMigrationSteps = {
  prepare: PgMigrationQueries;
  rollout: PgMigrationQueries;
  cleanup: PgMigrationQueries;
};
