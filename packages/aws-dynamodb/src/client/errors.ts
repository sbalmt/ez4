export class UnsupportedTransactionError extends Error {
  constructor() {
    super(`DynamoDB tables don't support function transaction.`);
  }
}

export class UnsupportedNamedParametersError extends Error {
  constructor() {
    super(`DynamoDB table don't support named parameters.`);
  }
}

export class MissingRepositoryTableError extends Error {
  constructor(public tableAlias: string) {
    super(`DynamoDB table ${tableAlias} isn't part of the repository.`);
  }
}
