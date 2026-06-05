# EZ4: Scheduler Client

The scheduler client exposes a simple, type-safe API for managing scheduled events. It is injected into the execution context when the scheduler service is available in another service.

## Client API

The client API provides a unified, provider-agnostic way to interact with scheduled events no matter which cloud provider is being used.

#### Create a scheduled event

```ts
export async function anotherHandler(_request: any, context: Service.Context<MyService>) {
  const { myScheduler } = context;

  await myScheduler.createEvent('scheduler-id', {
    date: new Date(Date.now() + 60 * 1000),
    event: {
      foo: 'foo',
      bar: 123
    }
  });
}
```

> The scheduler client validates the event payload against the declared scheduler event type before creating the event.

#### Get a scheduled event

```ts
export async function anotherHandler(_request: any, context: Service.Context<MyService>) {
  const { myScheduler } = context;

  const event = await myScheduler.getEvent('scheduler-id');
}
```

#### Update a scheduled event

```ts
export async function anotherHandler(_request: any, context: Service.Context<MyService>) {
  const { myScheduler } = context;

  await myScheduler.updateEvent('scheduler-id', {
    date: new Date(Date.now() + 120 * 1000)
  });
}
```

#### Delete a scheduled event

```ts
export async function anotherHandler(_request: any, context: Service.Context<MyService>) {
  const { myScheduler } = context;

  await myScheduler.deleteEvent('scheduler-id');
}
```

#### Create or replace a scheduled event

```ts
export async function anotherHandler(_request: any, context: Service.Context<MyService>) {
  const { myScheduler } = context;

  await myScheduler.setEvent('scheduler-id', {
    date: new Date(Date.now() + 180 * 1000),
    event: {
      foo: 'foo',
      bar: 123
    }
  });
}
```

## What's next

- [Scheduler service](./scheduler-service.md)
- [Scheduler target](./scheduler-target.md)
- [Scheduler requests](./scheduler-requests.md)
- [Scheduler listener](./scheduler-listener.md)

## License

MIT License
