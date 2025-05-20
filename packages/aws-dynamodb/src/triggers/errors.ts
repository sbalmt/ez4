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
    super(`DynamoDB doesn't support '${mode}' transaction mode.`);
  }
}

export class UnsupportedParametersModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support '${mode}' parameters mode.`);
  }
}

export class UnsupportedPaginationModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support '${mode}' pagination mode.`);
  }
}

export class UnsupportedOrderModeError extends Error {
  constructor(public mode: string) {
    super(`DynamoDB doesn't support '${mode}' order mode.`);
  }
}
