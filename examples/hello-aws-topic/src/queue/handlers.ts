import type { Queue } from '@ez4/queue';
import type { MessageRequest } from '../types.js';

export function messageHandlerC(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler C (SQS subscription)', message);

  // Do another stuff...
  message.foo;
}
