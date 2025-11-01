import type { Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types';
import type { Sqs } from './service';

export function messageHandlerA(request: Queue.Incoming<MessageRequest>, context: Service.Context<Sqs>): void {
  const { selfVariables } = context;
  const { message } = request;

  console.log('Handler A', selfVariables.TEST_VAR1, message);

  // Do some stuff...
  selfVariables.TEST_VAR1;
  message.foo;
}

export function messageHandlerB(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler B', message);

  // Do another stuff...
  message.foo;
}

export function messageHandlerC(request: Queue.Incoming<MessageRequest>, context: Service.Context<Sqs>): void {
  const { selfVariables } = context;
  const { message } = request;

  console.log('Handler C', selfVariables.TEST_VAR1, message);

  // Do another stuff...
  message.foo;
}
