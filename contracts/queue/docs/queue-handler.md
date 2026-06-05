# EZ4: Queue Handler

Queue handlers define the **business logic** executed when a subscription receives messages. A handler receives a fully typed request object, a runtime context, and return void. Handlers run inside an isolated cloud resource and represent the core execution unit of a queue.

## Message handler

```ts
export function myHandler(request: Queue.Incoming<MyMessage>, context: Service.Context<MyQueue>): void {
  const { message } = request;

  // Business logic here.
}
```

> Queue handlers use the queue service as its context, check queue [service](./queue-service.md) for more details.

#### Request fields

Handlers receive a typed request object generated from the message contract.

- **Message** - Typed object containing the message payload.
- **Trace Id** - A unique identifier across multiple services.
- **Request Id** - A unique identifier for the request.

All fields are validated and transformed according to the declared contract, as mentioned in the [requests](./queue-requests.md) documentation.

#### Error handling

- Unhandled exceptions thrown by the handler follow retry semantics defined by the queue contract.
- Use the `deadLetter` configuration to route permanently failing messages to a dead‑letter queue for inspection.

#### Acknowledgement and Visibility

- Handlers should be written assuming at‑least‑once delivery, the same message may be delivered more than once.
- Successful completion of the handler results in message acknowledgement (deletion).

#### Timeouts and Resource limits

- Keep handler execution within the `timeout` window configured at queue contract.
- Use `batch` and `concurrency` to tune throughput vs latency.

## What's next

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue listener](./queue-listener.md)

## License

MIT License
