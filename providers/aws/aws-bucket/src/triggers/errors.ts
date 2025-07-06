export class RoleMissingError extends Error {
  constructor() {
    super(`Execution role for S3 is missing.`);
  }
}
