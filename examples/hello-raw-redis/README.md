# Hello: Raw Redis

This example showcases how to set and use an external Redis (managed or
self-hosted) through the `@ez4/raw-redis` provider.

## Getting started

Create a `local.env` following the contents of `example.env` file in the example's root directory, and fill it with the AWS credentials and the Redis connection.

**Env var convention:** `EZ4_RAW_REDIS_<SERVICE_NAME>_URL` (snake-uppercase), plus
`EZ4_RAW_REDIS_<SERVICE_NAME>_TOKEN` for the Redis REST API.
Service named `CacheService` → `EZ4_RAW_REDIS_CACHE_SERVICE_URL`.

#### Install

```sh
npm install
```

#### Emulate

```sh
npm run serve
```

> This action will run a local version of the project using the configured Redis.

#### Deploy

```sh
npm run deploy
```

> This action will create resources on the given AWS account and propagate the Redis connection to the Lambda functions.

#### Destroy

```sh
npm run destroy
```

> This action will delete all the previously created resources on the given AWS account (the Redis server isn't touched).

## License

MIT License
