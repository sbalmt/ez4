export class MalformedRequestError extends Error {
  constructor(
    public table: string,
    public details: string[]
  ) {
    super(`Malformed schema for table '${table}'.`);
  }
}

export class MissingRelationDataError extends Error {
  constructor(public alias: string) {
    super(`Relation data for '${alias}' is missing.`);
  }
}

export class MissingFieldSchemaError extends Error {
  constructor(public field: string) {
    super(`Schema for field '${field}' is missing.`);
  }
}

export class InvalidRelationFieldError extends Error {
  constructor(
    public table: string,
    public field: string
  ) {
    super(`Relation field '${field}' on table '${table}' has an invalid format.`);
  }
}

export class InvalidAtomicOperation extends Error {
  constructor(public field: string) {
    super(`Atomic operation for field '${field}' isn't supported.`);
  }
}
