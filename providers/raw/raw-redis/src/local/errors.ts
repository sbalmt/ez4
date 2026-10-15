export class LocalOptionsNotFoundError extends Error {
  constructor(
    public optionsName: string,
    public serviceName: string,
    public envName: string
  ) {
    super(`Raw-redis cache service ${serviceName} requires 'localOptions.${optionsName}.url' or env var '${envName}'.`);
  }
}
