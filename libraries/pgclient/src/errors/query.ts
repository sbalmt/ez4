export class MissingUniqueIndexError extends Error {
  constructor() {
    super(`Missing unique index for operation`);
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
