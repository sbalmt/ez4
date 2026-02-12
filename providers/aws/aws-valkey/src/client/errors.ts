export class CacheOperatorNotFoundError extends Error {
  constructor(public identifier: string) {
    super(`Cache operator '${identifier}' wasn't found.`);
  }
}
