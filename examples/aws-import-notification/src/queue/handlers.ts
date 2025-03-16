import type { Queue } from '@ez4/queue';
import type { MessageRequest } from 'hello-aws-notification';

export function messageHandlerB(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B', JSON.stringify(message));

  // Do another stuff...
  message.foo;
}
