export class MissingConnectionUrlError extends Error {
  constructor(
    public envName: string,
    public serviceName: string
  ) {
    super(
      `Raw-redis cache service '${serviceName}' requires env var '${envName}' at deploy time. ` +
        `Set it to your Redis URL (redis://, rediss:// or the REST API https:// URL).`
    );
  }
}

export class MissingConnectionTokenError extends Error {
  constructor(
    public envName: string,
    public serviceName: string
  ) {
    super(`Raw-redis cache service '${serviceName}' uses the REST API and requires env var '${envName}' at deploy time.`);
  }
}
