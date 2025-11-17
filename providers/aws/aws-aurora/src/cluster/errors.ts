export class ClusterDatabaseNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Database service ${serviceName} wasn't found.`);
  }
}
