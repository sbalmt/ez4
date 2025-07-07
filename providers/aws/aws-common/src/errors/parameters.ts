export class InvalidParameterError extends Error {
  constructor(
    public serviceName: string,
    message: string
  ) {
    super(`[${serviceName}]: Invalid configuration, ${message}.`);
  }
}
