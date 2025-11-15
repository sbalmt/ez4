export class LocalOptionsNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Local options for database service ${serviceName} wasn't found.`);
  }
}
