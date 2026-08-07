# EZ4: Contracts Overview

EZ4 uses TypeScript to define strongly‑typed **contracts** that declare your application's infrastructure. Instead of writing verbose IaC definitions for every cloud-based resource, you declare how they connect and what parameters they need. These contracts become the **single source of truth** for both your infrastructure and your application code.

## Connecting resources

Every contract dealing with handlers has support for a `services` property, which lets you declare dependencies on resources. At runtime, EZ4 automatically injects these connected resources into your function's context, allowing you to consume them as typed service clients.

```ts
export declare class AnotherResource extends Example.Service {
  // Resource parameters...
}

export declare class MainResource extends Example.Service {
  handler: typeof resourceHandler;

  services: {
    // From AnotherResource, provide a service consumer.
    anotherService: Environment.Service<AnotherResource>;
  };
}

export function resourceHandler({ anotherService }: Service.Context<MainResource>) {
  // Use the provided resource service.
  anotherService.dummyMethod();
}
```

> This pattern keeps your infrastructure relationships explicit, type‑safe, and easy to reason about.

When bundling `resourceHandler`, EZ4 reflects over the contract's type declarations to resolve all connected resources and generate the corresponding service clients. These clients are embedded into the bundle and later injected at runtime through the handler context (Prefer destructuring contexts to inject only the necessary dependencies). Since the implementations are produced from the contract metadata, no concrete classes exist for the contract types.

### Context resolution at runtime

Service context is resolved lazily at runtime. Accessing a context key that was not declared in `services` throws an error. Keep handlers explicit by destructuring only the dependencies they actually need, as this can reduce bundle size and cold starts.

## Environment variables

Contracts that define a handler can also declare **environment variables** using the `variables` property, making configuration explicit and type‑safe at the TypeScript level. During metadata build (including deploy and serve flows), EZ4 resolves each declared variable: `Environment.Variable<'NAME'>` must resolve to a non-empty value, while `Environment.VariableOrValue<'NAME', Default>` falls back to its default when the environment variable is missing. At runtime, variables exposed through `Environment.ServiceVariables` are injected as strings.

```ts
export declare class MainResource extends Example.Service {
  handler: typeof resourceHandler;

  variables: {
    myVariable1: Environment.Variable<'SERVICE_VARIABLE_1'>;
    myVariable2: Environment.VariableOrValue<'SERVICE_VARIABLE_2', 'default value'>;
    myVariable3: 'literal value';
  };

  services: {
    // Expose the declared environment variables as a service
    variables: Environment.ServiceVariables;
  };
}

export function resourceHandler({ variables }: Service.Context<MainResource>) {
  // Use the injected environment variables.
  variables.myVariable1;
  variables.myVariable2;
  variables.myVariable3;
}
```

This keeps configuration explicit and discoverable while avoiding unnecessary runtime overhead. TypeScript ensures correctness during development, and EZ4 resolves and validates variables during metadata build.

### Linked service variable collisions

When linked services expose variables into the same target context, variable aliases must be consistent. If two linked services provide the same alias with different values, metadata build fails. Use unique aliases across linked service graphs to avoid collisions.

## Circular linked services

Circular linked services are supported. EZ4 resolves linked contexts lazily and caches intermediate linked contexts while preparing metadata. Prefer small constructors and avoid heavy side effects during service initialization when using circular dependencies.

## All contracts

- [Gateway](../contracts/gateway/README.md)
- [Database](../contracts/database/README.md)
- [Cache](../contracts/cache/README.md)
- [Scheduler](../contracts/scheduler/README.md)
- [Storage](../contracts/storage/README.md)
- [Topic](../contracts/topic/README.md)
- [Queue](../contracts/queue/README.md)
- [Distribution](../contracts/distribution/README.md)
- [Email](../contracts/email/README.md)
- [Validation](../contracts/validation/README.md)
- [Factory](../contracts/factory/README.md)

## What's next

- [Quick start](./quick-start.md)
- [Architecture overview](./architecture.md)
- [Philosophy](./philosophy.md)

## License

MIT License
