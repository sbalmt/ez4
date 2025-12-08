import type { Ws } from '@ez4/gateway';

/**
 * Authorization identity.
 */
export declare class Identity implements Ws.Identity {
  userId: string;
}

/**
 * Authorization response.
 */
export declare class AuthorizerResponse implements Ws.AuthResponse {
  identity: Identity;
}

/**
 * WebSocket events.
 */
export type AllEvents = FooEvent | BarEvent;

/**
 * Foo event.
 */
export type FooEvent = {
  type: EventType.Foo;
  value: string;
};

/**
 * Bar event.
 */
export type BarEvent = {
  type: EventType.Bar;
  value: number;
};

/**
 * Event type.
 */
export const enum EventType {
  Foo = 'foo',
  Bar = 'bar'
}
