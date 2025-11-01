export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for SQS is missing.`);
  }
}
