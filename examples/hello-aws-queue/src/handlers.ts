import type { Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';
import type { MessageRequest } from './types';
import type { Sqs } from './service';

/**
 * Wrap queue handler execution.
 */
export function queueMiddleware(next: Queue.Handler<MessageRequest>): Queue.Handler<MessageRequest> {
  return async (request, context) => {
    console.log('Queue middleware before', request.requestId);

    try {
      return await next(request, context);
    } finally {
      console.log('Queue middleware after', request.requestId);
    }
  };
}

export function messageHandlerA(request: Queue.Incoming<MessageRequest>, { selfVariables }: Service.Context<Sqs>): void {
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

export function messageHandlerC(request: Queue.Incoming<MessageRequest>, { selfVariables }: Service.Context<Sqs>): void {
  const { message } = request;

  console.log('Handler C', selfVariables.TEST_VAR1, message);

  // Do another stuff...
  message.foo;
}
