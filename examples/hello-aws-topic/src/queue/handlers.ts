import type { Queue } from '@ez4/queue';
import type { EventRequest } from '../types';

export function messageHandlerC(request: Queue.Incoming<EventRequest>): void {
  const { message } = request;

  console.log('Handler C (SQS subscription)', message);

  // Do another stuff...
  message.foo;
}
