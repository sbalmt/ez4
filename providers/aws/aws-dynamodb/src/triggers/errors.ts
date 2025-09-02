export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for DynamoDB is missing.`);
  }
}

export class UnsupportedRelationError extends Error {
  constructor() {
    super(`DynamoDB doesn't support relations.`);
  }
}

export class UnsupportedTransactionModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support the '${mode}' transaction mode.`);
  }
}

export class UnsupportedInsensitiveModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support the '${mode}' insensitive mode.`);
  }
}

export class UnsupportedParametersModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support the '${mode}' parameter mode.`);
  }
}

export class UnsupportedPaginationModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support the '${mode}' pagination mode.`);
  }
}

export class UnsupportedOrderModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support the '${mode}' order mode.`);
  }
}

export class UnsupportedLockModeError extends Error {
  constructor() {
    super(`DynamoDB doesn't support lock mode.`);
  }
}
