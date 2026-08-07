import type { Service } from '@ez4/common';
import type { Topic } from '@ez4/topic';
import type { EventRequest } from '../types';
import type { Sns } from '../service';

export function eventHandlerA(request: Topic.Incoming<EventRequest>, { selfVariables }: Service.Context<Sns>): void {
  const { event } = request;

  console.log('Handler A (direct subscription)', selfVariables.TEST_VAR1, event);

  // Do another stuff...
  event.foo;
}

export function eventHandlerB(request: Topic.Incoming<EventRequest>): void {
  const { event } = request;

  console.log('Handler B (direct subscription)', event);

  // Do another stuff...
  event.foo;
}
