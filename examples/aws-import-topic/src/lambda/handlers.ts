import type { MessageRequest } from 'hello-aws-topic';
import type { Topic } from '@ez4/topic';

export function messageHandlerA(request: Topic.Incoming<MessageRequest>): void {
  const { message } = request;

  console.log('Handler A', message);

  // Do some stuff...
  message.foo;
}
