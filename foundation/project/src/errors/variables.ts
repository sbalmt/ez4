export class DuplicateVariablesError extends Error {
  constructor(
    public variableName: string,
    public serviceName: string
  ) {
    super(`Variable ${variableName} for service ${serviceName} is duplicate.`);
  }
}
