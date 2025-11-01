export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for SNS is missing.`);
  }
}
