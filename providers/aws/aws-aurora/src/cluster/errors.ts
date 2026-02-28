export class ClusterDatabaseNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Database service ${serviceName} wasn't found.`);
  }
}

export class ClusterDeletionDeniedError extends Error {
  constructor(serviceName: string) {
    super(`Deletion protection for cluster ${serviceName} is enabled.`);
  }
}
