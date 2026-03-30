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

export function resourceHandler(context: Service.Context<MainResource>) {
  const { anotherService } = context;

  // Use the provided resource service.
  anotherService.dummyMethod();
}
```

> This pattern keeps your infrastructure relationships explicit, type‑safe, and easy to reason about.

When bundling `resourceHandler`, EZ4 reflects over the contract's type declarations to resolve all connected resources and generate the corresponding service clients. These clients are embedded into the bundle and later injected at runtime. Since the implementations are produced from the contract metadata, no concrete classes exist for the contract types.

## Environment variables

Contracts that define a handler can also declare **environment variables** using the `variables` property, making configuration explicit and type‑safe at the TypeScript level. During deployment, EZ4 performs minimal validation to ensure that each declared variable exists in the deployment environment and is not empty. At runtime, all variables are injected as strings.

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

export function resourceHandler(context: Service.Context<MainResource>) {
  const { variables } = context;

  // Use the injected environment variables.
  variables.myVariable1;
  variables.myVariable2;
  variables.myVariable3;
}
```

This keeps configuration explicit and discoverable while avoiding unnecessary runtime overhead. TypeScript ensures correctness during development, and EZ4 ensures the variable exists and is not empty during deployment.

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
