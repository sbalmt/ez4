import type { Client, Queue } from '@ez4/queue';

export const send = async (request: { message: { value: string } }, context: { queue: Client<{ value: string }, Queue.Mode> }) => {
  await context.queue.sendMessage(request.message, { delay: 0 });
};
