# EZ4: Database Listener

Database listeners observe the **lifecycle events** of table stream handler execution. Listeners run alongside handlers and receive typed execution events and contextual information about the database service. Listeners do **not** modify the request, they only observe execution flow.

## Listener implementation

```ts
import type { Service } from '@ez4/common';
import type { Database } from '@ez4/database';

import { ServiceEventType } from '@ez4/common';

export function streamListener(event: Database.ServiceEvent<ItemSchema>, context: Service.Context<MyDb>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Stream request processing started.
      break;

    case ServiceEventType.Ready:
      // The stream event is ready for the handler.
      break;

    case ServiceEventType.Done:
      // The handler completed successfully.
      break;

    case ServiceEventType.Timeout:
      // The handler is about to time out.
      break;

    case ServiceEventType.Error:
      // Stream processing or handler execution failed.
      break;

    case ServiceEventType.End:
      // Stream request processing finished.
      break;
  }
}
```

See [database streams](./database-streams.md) for how to attach listeners to table streams.

## Listener events

Listeners receive one or more of the following event types during the stream handler lifecycle. Events include a `request` field containing the incoming stream event available at that stage.

- **Begin** - emitted when stream event processing starts.
- **Ready** - emitted when the stream event is ready for the handler.
- **Done** - emitted when the handler returns successfully.
- **Timeout** - emitted when the handler is approaching its execution limit.
- **Error** - emitted when stream processing or handler execution throws an exception.
- **End** - emitted when processing finishes, regardless of success or failure.

## Listener failures

Listener failures are handled according to the event's role in the execution lifecycle. A failure in a lifecycle event can affect stream processing or be logged as a best-effort notification, depending on the selected database provider.

Listeners should focus on observability, such as logging, metrics, and tracing. They should not perform required stream processing in listener events.

> Listener availability, delivery guarantees, batching, retry behavior, and failure handling depend on the selected provider.

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
