# EZ4: Queue Handler

Queue handlers define the **business logic** executed when a subscription receives messages. A handler receives a fully typed request object, a runtime context, and return void. Handlers run inside an isolated cloud resource and represent the core execution unit of a queue.

## Message handler

```ts
export function myHandler(request: Queue.Incoming<MyMessage>, context: Service.Context<MyQueue>): void {
  // Business logic here.
}
```

> Queue handlers use the queue service as its context, check queue [service](./queue-service.md) for more details.

#### Request fields

Handlers receive a typed request object generated from the declared queue message type.

- **Message** - Typed object containing the message payload.
- **Attempt** - Current delivery attempt.
- **Max Attempts** - Maximum attempts configured by the queue dead-letter settings.
- **Trace Id** - A unique identifier across multiple services.
- **Request Id** - A unique identifier for the request.
- **Retry** - Method for requesting redelivery, optionally with a custom delay.

All fields are validated and transformed according to the declared queue service schema, as mentioned in the [requests](./queue-requests.md) documentation.

#### Error handling

- Throwing an exception from the handler also causes the message to be retried according to the queue service retry semantics.
- Call `request.retry()` to request redelivery without throwing an exception. Pass `{ delay }` to override the calculated backoff for that retry.
- Use the `deadLetter` configuration to route permanently failing messages to a dead‑letter queue for inspection.

#### Acknowledgement and Visibility

- Handlers should be written assuming at‑least‑once delivery, the same message may be delivered more than once.
- Successful completion of the handler results in message acknowledgement (deletion).

#### Timeouts and Resource limits

- Keep handler execution within the `timeout` window configured on the queue service.
- Use `batch` and `concurrency` to tune throughput vs latency.

## What's next

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue listener](./queue-listener.md)
- [Queue client](./queue-client.md)

## License

MIT License
