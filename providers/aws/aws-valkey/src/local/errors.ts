export class LocalOptionsNotFoundError extends Error {
  constructor(
    public optionsName: string,
    public serviceName: string
  ) {
    super(`Local options ${optionsName} for cache service ${serviceName} wasn't found.`);
  }
}
