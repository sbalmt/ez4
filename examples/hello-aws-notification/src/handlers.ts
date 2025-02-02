import type { Notification } from '@ez4/notification';
import type { MessageRequest } from './types.js';

export function messageHandlerA(request: Notification.Incoming<MessageRequest>): void {
  const { message } = request;

  // Do some stuff...
  message.foo;
}

export function messageHandlerB(request: Notification.Incoming<MessageRequest>): void {
  const { message } = request;

  // Do another stuff...
  message.foo;
}
