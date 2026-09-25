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
      // Handler execution completed successfully.
      break;

    case ServiceEventType.Timeout:
      // Handler execution is timing out and is gonna be aborted.
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
- **Timeout** - emitted when the handler has 1 second left before its termination.
- **Error** - emitted when validation or handler execution throws an exception.
- **End** - emitted at the end of processing, regardless of success or failure.

## Listener failures

Listener failures follow the event's role in the execution lifecycle:

- `Begin` and `Ready` are fail-fast. If either listener event fails, scheduled event execution fails.
- `Done`, `Timeout`, `Error`, and `End` are best-effort notifications. A failure in one of these listener events is logged and does not change the handler result.

Listeners should keep best-effort events focused on observability, such as logging, metrics, and tracing. They should not perform required scheduled work in those events.

## What's next

- [Scheduler service](./scheduler-service.md)
- [Scheduler target](./scheduler-target.md)
- [Scheduler requests](./scheduler-requests.md)
- [Scheduler client](./scheduler-client.md)

## License

MIT License
