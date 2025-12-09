/**
 * WebSocket events.
 */
export type AllEvents = EchoEvent | CloseEvent;

/**
 * Echo event.
 */
export type EchoEvent = {
  type: EventType.Echo;
  value: string;
};

/**
 * Close event.
 */
export type CloseEvent = {
  type: EventType.Close;
};

/**
 * Event type.
 */
export const enum EventType {
  Echo = 'echo',
  Close = 'close'
}
