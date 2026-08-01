import type { EventRequest } from 'hello-aws-topic';
import type { Topic } from '@ez4/topic';

export function eventHandlerA(request: Topic.Incoming<EventRequest>): void {
  const { event } = request;

  console.log('Handler A', event);

  // Do some stuff...
  event.foo;
}
