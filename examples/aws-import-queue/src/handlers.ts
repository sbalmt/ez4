import type { MessageRequest } from 'hello-aws-queue';
import type { Queue } from '@ez4/queue';

export function messageHandler(request: Queue.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A', JSON.stringify(message));

  // Do some stuff...
  message.foo;
}
