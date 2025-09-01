import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types';

export function messageHandlerA(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A', message);

  // Do some stuff...
  message.foo;
}

export function messageHandlerB(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B', message);

  // Do another stuff...
  message.foo;
}

export function messageHandlerC(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler C', message);

  // Do another stuff...
  message.foo;
}
