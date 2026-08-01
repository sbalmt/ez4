import type { EventRequest } from 'hello-aws-topic';
import type { Queue } from '@ez4/queue';

export function messageHandlerB(request: Queue.Incoming<EventRequest>): void {
  const { message } = request;

  console.log('Handler B', message);

  // Do another stuff...
  message.foo;
}
