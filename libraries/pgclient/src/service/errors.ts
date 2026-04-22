import { ServiceError } from '@ez4/common';

export class MalformedRequestError extends ServiceError {
  constructor(
    public field: string,
    details: string[]
  ) {
    super(`Malformed table schema for field '${field}'.`, { details });
  }
}

export class MissingRepositoryTableError extends Error {
  constructor(public tableAlias: string) {
    super(`Table ${tableAlias} isn't part of the repository.`);
  }
}

export class RaceConditionError extends Error {
  constructor(public tableName: string) {
    super(`Race condition for ${tableName} was detected.`);
  }
}
