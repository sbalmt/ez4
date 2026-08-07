# EZ4: Factory Service

A factory service defines a **reusable service factory** for your application. It bundles the factory handler, injected variables, and connected services, then produces a typed service instance. A `Factory.Service` is the top-level contract that EZ4 uses to construct reusable service objects and wire them into other application contexts.

## Service declaration

A factory service is declared by extending `Factory.Service<T>` and providing a handler that returns the service instance.

```ts
export declare class MyFactory extends Factory.Service<MyService> {
  handler: typeof createMyService;

  options: {
    myOption: string;
  };

  variables: {
    myVariable: Environment.Variable<'MY_VARIABLE'>;
  };

  services: {
    otherService: Environment.Service<OtherService>;
    variables: Environment.ServiceVariables;
    options: Environment.ServiceOptions;
  };
}
```

> A factory handler must be referenced with `typeof` because it is a declaration.

## Service fields

The following fields define how the factory constructs the service instance and what data is available during construction.

#### Handler

Defines the factory function that creates the service object.

- EZ4 invokes the handler lazily when the service is first accessed and exposes the result as a service `client`.
- The resulting client instance is reused for that injected service context.
- The handler receives only its context, without requests.
- It returns the constructed client instance.

```ts
handler: typeof createMyService;
```

#### Variables (optional)

Declares environment variables available to the factory handler.

- Supports both mapped variables and literal values.
- During metadata build, `Environment.Variable<'NAME'>` must resolve to a non-empty value.
- Use `Environment.VariableOrValue<'NAME', Default>` to fallback to `Default` when the environment variable is missing.
- Factory variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables` inside the handler.

```ts
variables: {
  myVariable: Environment.Variable<'MY_VARIABLE'>;
}
```

#### Options (optional)

Declares configuration values for the factory service.

- Options are stored as service metadata and typed by object shape.
- Use options for runtime behavior or isolated configuration values.
- Accessible through `Environment.ServiceOptions` inside the handler.

```ts
options: {
  myOption: string;
}
```

> Specify the factory `options` when injecting it in the dependent handler context. e.g. `Environment.Service<MyFactory, { myOption: 'special' }>`.

#### Services (optional)

Declares other service bindings available to the factory handler.

- Each entry is injected into the factory context.
- Useful for composing a service object from shared infrastructure or other contracts.
- Strongly typed and validated at compile time.

```ts
services: {
  otherService: Environment.Service<OtherService>;
  variables: Environment.ServiceVariables;
  options: Environment.ServiceOptions;
}
```

#### Client

The `client` field represents the constructed service instance returned by the factory handler.

- Other handlers can access the factory service instance through the service context.
- The returned object is strongly typed as the factory service payload type.

```ts
export function createMyService({ otherService, variables, options }: Service.Context<MyFactory>): MyService {
  if (options.myOption === 'special') {
    // runtime behavior based on service options
  }

  return new MyService();
}
```

> Factory services are not cloud resources. They exist to centralize object creation and reuse logic.

### Best practices

- Keep the handler focused on construction and wiring, not business logic.
- Use injected services and variables to compose the returned client instance.
- Use factory services to avoid duplicate service creation in multiple handlers.

## License

MIT License
