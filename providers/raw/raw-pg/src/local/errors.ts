export class LocalOptionsNotFoundError extends Error {
  constructor(
    public optionsName: string,
    public serviceName: string
  ) {
    super(`Local options ${optionsName} for raw-pg database service ${serviceName} wasn't found.`);
  }
}

export class IncompleteConnectionError extends Error {
  constructor(public serviceName: string) {
    super(
      `Raw-pg database service ${serviceName} requires either 'connectionString' or ` +
        `('host' + 'user' + 'password' + 'database') in localOptions.`
    );
  }
}
