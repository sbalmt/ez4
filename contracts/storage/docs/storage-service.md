# EZ4: Storage Service

A storage service defines the **object storage interface** of an application. It bundles bucket configuration, object-event handlers, environment variables, connected services, and the generated storage client. A `Bucket.Service` is the top-level contract that EZ4 uses to generate infrastructure and runtime bindings.

## Service declaration

A storage service is declared by extending `Bucket.Service` and optionally defining events, lifecycle settings, CORS rules, variables, tags, and connected services.

```ts
import type { Environment } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class MyStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'uploads/*.ext';
      handler: typeof handleObject;
    }>
  ];
}
```

## Service fields

The following fields define the bucket configuration and the runtime environment of its event handlers.

#### Events (optional)

Defines the object events handled by the bucket. Each event can match an object-key prefix, or split the match into a prefix and suffix with `*`.

```ts
events: [
  Bucket.UseEvent<{
    path: 'uploads/*.ext';
    handler: typeof handleObject;
  }>
];
```

> The `*` wildcard matches the middle of an object key. In `uploads/*.ext`, the key must start with `uploads/` and end with `.ext`.

See [Storage events](./storage-events.md) for handler and listener details.

#### CORS (optional)

Defines browser access rules for clients accessing the bucket directly. `allowOrigins` is required; the other fields are optional.

```ts
cors: Bucket.UseCors<{
  allowOrigins: ['https://app.example.com'];
  allowMethods: ['GET', 'PUT'];
  allowHeaders: ['content-type'];
  exposeHeaders: ['etag'];
  maxAge: 3600;
}>;
```

Use CORS when browser clients upload to or download from the bucket through provider-supported cross-origin requests.

#### Global name (optional)

Overrides the provider-generated bucket name. Use this when an external system already depends on a stable bucket name.

```ts
globalName: 'my-bucket';
```

#### Local path (optional)

Specifies a local directory whose contents are uploaded to the bucket and kept synchronized during deployment. It is also used by the local storage provider for local development and tests.

```ts
localPath: './.storage';
```

#### Auto-expiration (optional)

Deletes objects automatically after the configured number of days. This is useful for temporary uploads, generated artifacts, and processing files.

```ts
autoExpireDays: 30;
```

#### Variables (optional)

Declares environment variables that apply to every function event attached to the bucket.

- Supports both mapped variables and literal values.
- During metadata build, `Environment.Variable<'NAME'>` must resolve to a non-empty value.
- Use `Environment.VariableOrValue<'NAME', Default>` to fallback to `Default` when the environment variable is missing.
- Storage service variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables`.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

#### Custom tags (optional)

Declares custom tags for the bucket resource.

- Tags are defined as a string-to-string object through `Bucket.UseTags`.
- Tags are attached to the bucket during deployment and can be updated or removed on later deployments.
- Project deployment tags are merged with service tags; when the same key is defined in both places, the project deployment tag takes precedence.

```ts
tags: Bucket.UseTags<{
  Environment: 'production';
  Team: 'platform';
}>;
```

#### Services (optional)

Declares service bindings available to all function events attached to the bucket.

- Each entry represents a service that will be injected into the execution context.
- Useful for exposing shared infrastructure or internal services.
- Strongly typed and validated at compile time.

```ts
services: {
  serviceA: Environment.ServiceVariables;
  serviceB: Environment.Service<ServiceB>;
}
```

Project deployment tags take precedence when the same key is defined in both places.

### Best practices

- Use a path prefix to keep unrelated object workflows separate.
- Set `autoExpireDays` for temporary uploads, generated files, and processing artifacts.
- Keep event handlers focused and use linked services for application-side processing.
- Use `localPath` to make local development deterministic without changing cloud configuration.
- Use `globalName` only when a stable external bucket name is required; otherwise prefer provider-generated names.

## What's next

- [Storage events](./storage-events.md)
- [Storage handlers](./storage-handlers.md)
- [Storage listener](./storage-listener.md)
- [Storage client](./storage-client.md)

## Examples

- [Storage manager](../../../examples/aws-storage-manager)

## Providers

- [Local provider](../../../providers/local/local-storage)
- [AWS provider](../../../providers/aws/aws-bucket)

## License

MIT License
