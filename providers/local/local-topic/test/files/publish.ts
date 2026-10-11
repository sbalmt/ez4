import type { Client } from '@ez4/topic';

export const publish = async (request: { event: { value: string } }, context: { topic: Client<{ value: string }> }) => {
  await context.topic.publishEvent(request.event);
};
