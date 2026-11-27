import type { Database, Client } from '@ez4/database';
import type { TestEngine } from '../common/engines';

declare class TestSchema implements Database.Schema {
  foo: string;
}

export declare class TestDatabase extends Database.Service<TestEngine> {
  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        handler: typeof streamHandler;
        middlewares: [typeof firstMiddleware, typeof secondMiddleware];
        listener: typeof streamListener;
      };
    }>
  ];
}

export function streamHandler(_change: Database.Incoming<TestSchema>) {}

export function firstMiddleware<T extends Database.Schema>(next: Database.Handler<T>, { firstMiddlewareClient }: any): Database.Handler<T> {
  void firstMiddlewareClient;

  return (request, context) => next(request, context);
}

export function secondMiddleware<T extends Database.Schema>(
  next: Database.Handler<T>,
  { secondMiddlewareClient }: any
): Database.Handler<T> {
  void secondMiddlewareClient;

  return (request, context) => next(request, context);
}

export function streamListener(_event: Database.ServiceEvent<TestSchema>, { streamListenerClient }: any): void {
  void streamListenerClient;
}
