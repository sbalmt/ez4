export class CacheNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Cache service ${serviceName} wasn't found.`);
  }
}

export class CacheDeletionDeniedError extends Error {
  constructor(cacheName: string) {
    super(`Deletion protection for cache ${cacheName} is enabled.`);
  }
}
