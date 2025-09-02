import type { Topic } from '@ez4/topic';
import type { MessageRequest } from '../types';

export function messageHandlerA(request: Topic.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A (direct subscription)', message);

  // Do another stuff...
  message.foo;
}

export function messageHandlerB(request: Topic.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B (direct subscription)', message);

  // Do another stuff...
  message.foo;
}
