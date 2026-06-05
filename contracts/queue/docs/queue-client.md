# EZ4: Queue Client

The queue client exposes a simple, type-safe API for sending and receiving messages with the generated queue service. It is injected into the execution context when the queue service is available.

## Client API

The client API provides a unified, provider-agnostic way to access the queue service no matter which cloud provider is being used.

#### Send a message

```ts
export async function publishMessage(_request: any, context: Service.Context<MyService>) {
  const { myQueue } = context;

  await myQueue.sendMessage({
    foo: 'foo',
    bar: 123
  });
}
```

> The queue client validates the message against the declared queue message type before sending.

#### Receive messages

```ts
export async function pollQueue(_request: any, context: Service.Context<MyService>) {
  const { myQueue } = context;

  const messages = await myQueue.receiveMessage({
    messages: 10,
    polling: 20
  });

  return messages;
}
```

> The `receiveMessage` call returns zero or more typed messages and supports optional polling and batch size configuration.

## Notes

- FIFO queues restrict standard send options through the generated client types.
- The queue client is the preferred entry point for routine queue operations.
- Implementation-specific runtime features like visibility timeouts or receipt-handle deletion are typically available through the provider SDK, not the generated client.

## What's next

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue handler](./queue-handler.md)
- [Queue listener](./queue-listener.md)

## License

MIT License
