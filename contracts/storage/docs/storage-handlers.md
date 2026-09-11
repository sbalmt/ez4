# EZ4: Storage Handlers

Storage handlers define the business logic executed when a bucket receives an object event. Each handler receives a typed incoming event, a storage service context, and returns void.

## Handler implementation

```ts
export function eventHandler(request: Bucket.Incoming, context: Service.Context<MyStorage>): void {
  // Business logic here.
}
```

> Storage handlers use the storage service as their context provider. See [Storage events](./storage-events.md) for the handler declaration and execution options.

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
- [Storage listener](./storage-listener.md)
- [Storage client](./storage-client.md)

## License

MIT License
