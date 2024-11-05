export class RoleMissing extends Error {
  constructor() {
    super(`Execution role for DynamoDB is missing.`);
  }
}
