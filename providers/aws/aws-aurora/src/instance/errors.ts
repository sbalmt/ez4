export class InstanceDeletionDeniedError extends Error {
  constructor(serviceName: string) {
    super(`Deletion protection for instance ${serviceName} is enabled.`);
  }
}
