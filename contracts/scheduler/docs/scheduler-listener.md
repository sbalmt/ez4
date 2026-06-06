# EZ4: Scheduler Listener

Scheduler listeners let you observe the **lifecycle events** of scheduled execution without modifying the request. They receive typed scheduler service events and the same context available to the handler.

## Listener implementation

Listeners receive typed service events for `Cron.Incoming<T>` where `T` is the scheduler event type.

```ts
export function myListener(event: Service.AnyEvent<Cron.Incoming<MySchedulerEvent>>, context: Service.Context<MyScheduler>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Scheduled event processing started.
      break;

    case ServiceEventType.Ready:
      // Request validation and transformation completed.
      break;

    case ServiceEventType.Done:
      // Handler completed successfully.
      break;

    case ServiceEventType.Error:
      // Handler execution or validation failed.
      break;

    case ServiceEventType.End:
      // Scheduled event processing finished.
      break;
  }
}
```

See scheduler [target](./scheduler-target.md) for how to attach a listener to the target.

## Listener events

Listeners receive one or more of the following event types during execution.

- **Begin** - emitted when the scheduler begins processing an event.
- **Ready** - emitted when validation and transformation are complete.
- **Done** - emitted when the handler completes successfully.
- **Error** - emitted when validation or handler execution throws an exception.
- **End** - emitted at the end of processing, regardless of success or failure.

## What's next

- [Scheduler service](./scheduler-service.md)
- [Scheduler target](./scheduler-target.md)
- [Scheduler requests](./scheduler-requests.md)
- [Scheduler client](./scheduler-client.md)

## License

MIT License
