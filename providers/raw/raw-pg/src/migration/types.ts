import type { PgTableRepository } from '@ez4/pgclient/library';
import type { EntryState } from '@ez4/stateful';

export const MigrationServiceName = 'Raw:Pg/Migration';

export const MigrationServiceType = 'raw:pg.migration';

export type MigrationParameters = {
  repository: PgTableRepository;
  allowDeletion?: boolean;
  database: string;
  envName: string;
};

export type MigrationResult = {
  database: string;
};

export type MigrationState = EntryState & {
  type: typeof MigrationServiceType;
  parameters: MigrationParameters;
  result?: MigrationResult;
};
