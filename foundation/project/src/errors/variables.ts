export class MissingVariablesSupportError extends Error {
  constructor(public serviceName: string) {
    super(`Service ${serviceName} doesn't support variables.`);
  }
}
