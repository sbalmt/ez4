import type { PgTableRepository } from '@ez4/pgclient/library';
import type { EntryState } from '@ez4/stateful';

export const IntegrityServiceName = 'AWS:Aurora/Integrity';

export const IntegrityServiceType = 'aws:aurora.integrity';

export type IntegrityParameters = {
  getRepository: () => PgTableRepository;
  getDatabase: () => string;
};

export type IntegrityResult = {
  integrityHash: string;
  database: string;
};

export type IntegrityState = EntryState & {
  type: typeof IntegrityServiceType;
  parameters: IntegrityParameters;
  result?: IntegrityResult;
};
