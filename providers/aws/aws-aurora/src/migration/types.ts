import type { PgTableRepository } from '@ez4/pgclient/library';
import type { EntryState } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';

export const MigrationServiceName = 'AWS:Aurora/Migration';

export const MigrationServiceType = 'aws:aurora.migration';

export type MigrationParameters = {
  repository: PgTableRepository;
  allowDeletion?: boolean;
  database: string;
};

export type MigrationResult = {
  clusterArn: Arn;
  secretArn: Arn;
};

export type MigrationState = EntryState & {
  type: typeof MigrationServiceType;
  parameters: MigrationParameters;
  result?: MigrationResult;
};
