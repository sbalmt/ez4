import type { MessageRequest } from 'hello-aws-notification';
import type { Notification } from '@ez4/notification';

export function messageHandlerA(request: Notification.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A', message);

  // Do some stuff...
  message.foo;
}
