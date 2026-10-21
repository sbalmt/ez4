export class UnsupportedConnectionError extends Error {
  constructor(public protocol: string | undefined) {
    super(
      `Raw-redis connection protocol '${protocol ?? 'unknown'}' isn't supported. ` +
        `Use 'redis://' or 'rediss://' for the Redis protocol, or 'https://' for the Redis REST API.`
    );
  }
}

export class MissingConnectionTokenError extends Error {
  constructor() {
    super(`Raw-redis REST connections require a token.`);
  }
}
