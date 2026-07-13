import type { Queue } from '@ez4/queue';
import type { DedupMessageRequest, MessageRequest } from './types';

export function messageHandlerA(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A', message);

  message.foo;
}

export function messageHandlerC(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler C', message);

  message.foo;
}

export function messageHandlerDedup(request: Queue.Incoming<DedupMessageRequest>): void {
  const { message } = request;

  console.log('Handler Dedup', message);

  message.foo;
  message.baz;
}
