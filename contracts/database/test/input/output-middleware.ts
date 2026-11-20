import type { Database, Client } from '@ez4/database';
import type { TestEngine } from '../common/engines';

declare class TestSchema implements Database.Schema {
  foo: string;
}

export declare class TestDatabase extends Database.Service<TestEngine> {
  tables: [
    Database.UseTable<{
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        handler: typeof streamHandler;
        middlewares: [typeof firstMiddleware, typeof secondMiddleware];
      };
    }>
  ];

  client: Client<TestDatabase>;
}

export function firstMiddleware(next: Database.Handler<TestSchema>): Database.Handler<TestSchema> {
  return (request, context) => next(request, context);
}

export function secondMiddleware(next: Database.Handler<TestSchema>): Database.Handler<TestSchema> {
  return (request, context) => next(request, context);
}

export function streamHandler(_change: Database.Incoming<TestSchema>) {}
