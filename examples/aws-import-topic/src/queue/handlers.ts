import type { Queue } from '@ez4/queue';
import type { MessageRequest } from 'hello-aws-topic';

export function messageHandlerB(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B', message);

  // Do another stuff...
  message.foo;
}
