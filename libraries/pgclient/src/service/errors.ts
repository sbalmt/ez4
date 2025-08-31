import { ServiceError } from '@ez4/common';

export class MalformedRequestError extends ServiceError {
  constructor(
    public field: string,
    details: string[]
  ) {
    super(`Malformed table schema for field '${field}'.`, details);
  }
}

export class MissingRepositoryTableError extends Error {
  constructor(public tableAlias: string) {
    super(`Table ${tableAlias} isn't part of the repository.`);
  }
}

export class MissingFieldSchemaError extends Error {
  constructor(public field: string) {
    super(`Schema for field '${field}' is missing.`);
  }
}

export class InvalidFieldSchemaError extends Error {
  constructor(public field: string) {
    super(`Schema for field '${field}' is invalid.`);
  }
}

export class InvalidRelationFieldError extends Error {
  constructor(public field: string) {
    super(`Relation field '${field}' has an invalid format.`);
  }
}

export class InvalidAtomicOperation extends Error {
  constructor(public field: string) {
    super(`Atomic operation for field '${field}' isn't supported.`);
  }
}
