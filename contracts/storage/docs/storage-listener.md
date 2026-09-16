# EZ4: Storage Listener

Storage listeners observe the lifecycle of object-event processing. They run alongside the event handler and are useful for logging, metrics, tracing, and operational notifications.

## Listener implementation

A listener receives a typed `Service.AnyEvent<Bucket.Incoming>` and the storage service context:

```ts
function eventListener(event: Service.AnyEvent<Bucket.Incoming>, context: Service.Context<MyStorage>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Processing started.
      break;

    case ServiceEventType.Ready:
      // Event validation completed.
      break;

    case ServiceEventType.Done:
      // Handler completed successfully.
      break;

    case ServiceEventType.Timeout:
      // Handler is approaching its execution limit.
      break;

    case ServiceEventType.Error:
      // Validation or handler execution failed.
      break;

    case ServiceEventType.End:
      // Processing finished.
      break;
  }
}
```

## Attach a listener

Attach the listener alongside the event handler:

```ts
events: [
  Bucket.UseEvent<{
    path: 'uploads/';
    handler: typeof handleObject;
    listener: typeof eventListener;
  }>
];
```

Listeners observe processing; they do not replace or modify the event handler.

## Listener events

Listeners receive one or more of the following event types during the lifecycle of an event request. All events include a `request` field containing a **partial** version of the incoming request with only the fields available at that stage.

- **Begin** - emitted when the bucket receives an object event and begins processing.
- **Ready** - emitted when validation and transformation are complete for the incoming event.
- **Done** - emitted when the handler completes successfully.
- **Timeout** - emitted when the handler has 1 second left before its termination.
- **Error** - emitted when validation or handler execution throws an exception.
- **End** - emitted at the end of processing, regardless of success or failure.

## What's next

- [Storage service](./storage-service.md)
- [Storage events](./storage-events.md)
- [Storage handlers](./storage-handlers.md)
- [Storage client](./storage-client.md)

## License

MIT License
