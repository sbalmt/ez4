export class MalformedRequestError extends Error {
  constructor(
    public field: string,
    public details: string[]
  ) {
    super(`Malformed table schema for field '${field}'.`);
  }
}

export class MissingRepositoryTableError extends Error {
  constructor(public tableAlias: string) {
    super(`Table ${tableAlias} isn't part of the repository.`);
  }
}

export class MissingRelationDataError extends Error {
  constructor(public tableAlias: string) {
    super(`Relation data for '${tableAlias}' is missing.`);
  }
}

export class MissingFieldSchemaError extends Error {
  constructor(public field: string) {
    super(`Schema for field '${field}' is missing.`);
  }
}

export class UnsupportedFieldType extends Error {
  constructor(
    public field: string,
    public type: string
  ) {
    super(`Type ${type} for field ${field} isn't supported.`);
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
