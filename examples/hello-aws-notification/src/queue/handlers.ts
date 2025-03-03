import type { Notification } from '@ez4/notification';
import type { MessageRequest } from '../types.js';

export function messageHandlerC(request: Notification.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler C', JSON.stringify(message));

  // Do another stuff...
  message.foo;
}
