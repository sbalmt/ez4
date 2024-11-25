import type { Arn } from '@ez4/aws-common';
import type { EntryState } from '@ez4/stateful';
import type { Repository } from '../types/repository.js';

export const MigrationServiceName = 'AWS:Aurora/Migration';

export const MigrationServiceType = 'aws:aurora.migration';

export type MigrationParameters = {
  database: string;
  repository: Repository;
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
