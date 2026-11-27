# EZ4: Storage Handlers

Storage handlers define the business logic executed when a bucket receives an object event. Each handler receives a typed incoming event, a storage service context, and returns void.

## Handler implementation

Use `Bucket.Incoming` to access the validated object event.

```ts
export function eventHandler(request: Bucket.Incoming, { myClient, myVariables }: Service.Context<MyStorage>): void {
  // Access only the linked context services declared here.
  myClient.doSomething();
  myVariables.myVariable;
}
```

> Parameter destructuring is recommended because EZ4 uses the named bindings to retain only the linked services needed by the handler. Passing an entire context object or spreading it keeps all linked services available.

> Storage handlers use the [storage service](./storage-service.md) context to access linked services and variables.

## Handler middlewares

Storage events can wrap handlers with ordered [middleware](./storage-middleware.md). Middleware runs after validation and immediately before the user handler.

> Context references are inferred from parameter destructuring. Destructuring keeps only the named services; accepting the context without destructuring or using a spread keeps all linked services available. Services used only by a [middleware](../../../documentation/middlewares.md) or lifecycle listener must be destructured there as well; otherwise, when they are absent from the handler destructuring, they can be omitted from the bundle.

## Handler listener

Storage events can attach a lifecycle [listener](./storage-listener.md) to observe validation and execution events. Listeners observe execution, while middleware participates in handler execution.

## Request fields

Handlers receive a `Bucket.Incoming` value containing the object event and request metadata. The handler contract also permits a `Bucket.ObjectEvent` value when request metadata is not available.

- **Event Type** - `BucketEventType.Create` or `BucketEventType.Delete`.
- **Bucket Name** - The bucket that emitted the event.
- **Object Key** - The changed object key.
- **Object Size** - The object size when available.
- **Request Id** - A unique identifier for the request when available.
- **Trace Id** - An optional identifier shared across services.

## Error handling

- Unhandled exceptions follow the retry and failure behavior of the selected storage provider.
- Use object keys and event types to make handlers safe to run more than once.

## Delivery

- Storage handlers should be written as at-least-once consumers; the same object event may be delivered more than once.
- Use the object key and event type to distinguish creation and deletion workflows.

## What's next

- [Storage service](./storage-service.md)
- [Storage events](./storage-events.md)
- [Storage middlewares](./storage-middleware.md)
- [Storage listener](./storage-listener.md)
- [Storage client](./storage-client.md)

## License

MIT License
