import type { Cron } from '@ez4/scheduler';
import type { Service } from '@ez4/common';
import type { EventRequest } from '@/api/types';
import type { EventScheduler } from '@/scheduler';

import { updateEvent } from '@/api/repository';
import { EventStatus } from '@/schemas/event';

/**
 * Handle all schedule events.
 */
export async function scheduleEventHandler(request: Cron.Incoming<EventRequest>, context: Service.Context<EventScheduler>): Promise<void> {
  const { eventDb } = context;

  console.log('Schedule executed.', request);

  await updateEvent(eventDb, {
    id: request.event.id,
    status: EventStatus.Completed
  });

  // Do another stuff...
}
