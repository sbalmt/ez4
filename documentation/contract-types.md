# EZ4: Contract Types

EZ4 uses TypeScript to define strongly‑typed **contracts** that declare your application's infrastructure. Instead of writing verbose IaC definitions for every cloud-based resource, you declare how they connect and what parameters they need. These contracts become the **single source of truth** for both your infrastructure and your application code.

## Connecting resources

Every contract supports a `services` property, which lets you declare dependencies on resources. At runtime, EZ4 automatically injects these connected resources into your function’s context, allowing you to consume them as typed service clients.

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

## License

MIT License
