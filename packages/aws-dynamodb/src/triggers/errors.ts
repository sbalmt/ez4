export class RoleMissing extends Error {
  constructor() {
    super(`Execution role for DynamoDB is missing.`);
  }
}

export class UnsupportedRelations extends Error {
  constructor() {
    super(`DynamoDB doesn't support relations.`);
  }
}
