import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types.js';

export function messageHandlerA(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  // Do some stuff...
  message.foo;
}

export function messageHandlerB(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  // Do another stuff...
  message.foo;
}
