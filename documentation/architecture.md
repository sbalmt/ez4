# EZ4: Architecture Overview

EZ4 encourages a clean, predictable structure that separates infrastructure from behavior while keeping everything strongly typed and reflection‑driven. The following architecture provides a scalable foundation for teams building production‑ready applications with EZ4.

## Root-level contracts

Root‑level contracts represent **global infrastructure resources** used across the entire application, such as [Gateway](../contracts/gateway/), [Database](../contracts/database/), [Distribution](../contracts/distribution/), [Email](../contracts/email/), [Storage](../contracts/storage/), and [Cache](../contracts/cache/). Keeping them at the project root makes it easy to identify the core building blocks of your service.

```
src/
  module/
  api.ts
  database.ts
```

> These contracts define the backbone of your system and are typically referenced by multiple modules.

## Module-level contracts

Module‑level contracts represent **infrastructure resources that belong to a specific domain**, such as [Queues](../contracts/queue/), [Topics](../contracts/topic/), and [Schedulers](../contracts/scheduler/). Keeping them inside the module folder makes it clear which parts of the system depend on which resources.

```
src/
  module/
    queues/
      resource.ts
    schedulers/
      resource.ts
    topics/
      resource.ts
```

> This mirrors how real systems evolve and keeps related logic close together. Each module becomes a self‑contained unit with its own infrastructure and behavior.

## Service contracts

Handlers should remain thin orchestration layers. Business logic belongs in services, and EZ4 provides [Factory](../contracts/factory/) and [Validation](../contracts/validation/) contracts to help structure this layer cleanly.

```
src/
  module/
    services/
      factory.ts
      validation.ts
```

> Factories encapsulate reusable patterns, while Validation contracts ensure consistent input and data shaping across the module.

## Use repositories

Even though EZ4's Database client is powerful and expressive, it's best practice to centralize all queries inside repository files. This keeps data access consistent, testable, and easy to evolve.

```
src/
  module/
    repositories/
      repository_a.ts
      repository_b.ts
```

> Repositories act as the single source of truth for how your module interacts with the database.

## Organize by domain

Instead of grouping everything by technology (all queues together, all handlers together), group by **business capability**. This structure scales naturally as your application grows and keeps domain logic cohesive.

```
src/
  user/
    endpoints/
      create-user.ts
      update-user.ts
      list-users.ts
    queues/
      subscribe.ts
    repositories/
      crud.ts
    schemas/
      user.ts
  order/
    endpoints/
      create-order.ts
      update-order.ts
      list-orders.ts
    schedulers/
      reminder.ts
    repositories/
      crud.ts
    topics/
      finish-order.ts
  api.ts
  database.ts
```

> Each domain becomes a self‑contained module with its own endpoints, events, schemas, and infrastructure.

## Summary

A well‑structured EZ4 project keeps global infrastructure in root‑level contracts, places domain‑specific resources inside module‑level contracts, and maintains thin handlers that delegate to services and repositories. Each module owns its schemas, endpoints, events, and data access, forming a cohesive domain boundary. By organizing the codebase around business capabilities rather than technologies, centralizing queries in repositories, and using TypeScript as the single source of truth for both runtime and infrastructure, EZ4 projects remain clean, maintainable, and scalable as they grow.

## What's next

- [Quick start](./quick-start.md)
- [Contracts overview](./contracts.md)
- [Philosophy](./philosophy.md)

## License

MIT License
