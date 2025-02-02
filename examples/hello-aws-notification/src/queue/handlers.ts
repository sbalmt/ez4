import type { Notification } from '@ez4/notification';
import type { MessageRequest } from '../types.js';

export function messageHandlerC(request: Notification.Incoming<MessageRequest>): void {
  const { message } = request;

  // Do some stuff...
  message.foo;
}
