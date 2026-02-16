export class EmailIdentityNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Email identity ${serviceName} wasn't found.`);
  }
}
