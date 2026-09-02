export type PgMigrationStatement = {
  check?: string;
  query: string;
};

export type PgValidationStatement = {
  name: string;
  check?: string;
  query: string;
};

export type PgMigrationQueries = {
  tables: PgMigrationStatement[];
  constraints: PgMigrationStatement[];
  validations: PgValidationStatement[];
  relations: PgMigrationStatement[];
  indexes: PgMigrationStatement[];
};

export type PgMigrationStepQueries = {
  create: PgMigrationQueries;
  update: PgMigrationQueries;
  delete: PgMigrationQueries;
};
