export class MissingVariablesSupportError extends Error {
  constructor(public serviceName: string) {
    super(`Service ${serviceName} doesn't support variables.`);
  }
}

export class DuplicateVariablesError extends Error {
  constructor(
    public variableName: string,
    public serviceName: string
  ) {
    super(`Variable ${variableName} for service ${serviceName} is duplicate.`);
  }
}
