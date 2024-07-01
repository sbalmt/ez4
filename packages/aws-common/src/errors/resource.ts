export class IncompleteResourceError extends Error {
  constructor(
    public serviceName: string,
    public resourceId: string,
    public resourceName: string
  ) {
    super(`[${serviceName}]: Resource ${resourceId} is missing ${resourceName}.`);
  }
}

export class ReplaceResourceError extends Error {
  constructor(
    public serviceName: string,
    public resourceA: string,
    public resourceB: string
  ) {
    super(`[${serviceName}]: Impossible to replace ${resourceA} with ${resourceB}.`);
  }
}
