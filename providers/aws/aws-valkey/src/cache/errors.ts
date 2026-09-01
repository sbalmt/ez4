export class CacheNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Cache service '${serviceName}' wasn't found.`);
  }
}

export class RemoteCacheNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Remote cache service '${serviceName}' wasn't found.`);
  }
}
