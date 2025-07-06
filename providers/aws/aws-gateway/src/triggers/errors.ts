export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for API Gateway is missing.`);
  }
}
