import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types.js';

export function messageHandlerA(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A', JSON.stringify(message));

  // Do some stuff...
  message.foo;
}

export function messageHandlerB(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B', JSON.stringify(message));

  // Do another stuff...
  message.foo;
}

export function messageHandlerC(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler C', JSON.stringify(message));

  // Do another stuff...
  message.foo;
}
