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

export class UnsupportedTransactionError extends Error {
  constructor() {
    super(`DynamoDB doesn't support interactive transactions.`);
  }
}
