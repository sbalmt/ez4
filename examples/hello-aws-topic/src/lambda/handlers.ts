import type { Service } from '@ez4/common';
import type { Topic } from '@ez4/topic';
import type { MessageRequest } from '../types';
import type { Sns } from '../service';

export function messageHandlerA(request: Topic.Incoming<MessageRequest>, context: Service.Context<Sns>): void {
  const { selfVariables } = context;
  const { message } = request;

  console.log('Handler A (direct subscription)', selfVariables.TEST_VAR1, message);

  // Do another stuff...
  message.foo;
}

export function messageHandlerB(request: Topic.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B (direct subscription)', message);

  // Do another stuff...
  message.foo;
}
