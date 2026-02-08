export class CacheNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Cache service ${serviceName} wasn't found.`);
  }
}
