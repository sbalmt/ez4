import type { Notification } from '@ez4/notification';
import type { MessageRequest } from '../types.js';

export function messageHandlerA(request: Notification.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A (direct subscription)', message);

  // Do another stuff...
  message.foo;
}

export function messageHandlerB(request: Notification.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B (direct subscription)', message);

  // Do another stuff...
  message.foo;
}
