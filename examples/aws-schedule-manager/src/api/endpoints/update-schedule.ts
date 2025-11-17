import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '@/api';

import { HttpBadRequestError } from '@ez4/gateway';

import { updateEvent } from '@/api/repository';

/**
 * Update schedule request.
 */
declare class UpdateScheduleRequest implements Http.Request {
  parameters: {
    scheduleId: String.UUID;
  };
  body: {
    /**
     * New event date.
     */
    date?: String.DateTime;

    /**
     * New event message.
     */
    message?: string;
  };
}

/**
 * Update schedule response.
 */
declare class UpdateScheduleResponse implements Http.Response {
  status: 200;

  body: {
    message: string;
  };
}

/**
 * Handle update schedule requests.
 */
export async function updateScheduleHandler(
  request: UpdateScheduleRequest,
  context: Service.Context<Api>
): Promise<UpdateScheduleResponse> {
  const { eventDb, eventScheduler } = context;
  const { scheduleId } = request.parameters;
  const { date, message } = request.body;

  const exists = await eventScheduler.getEvent(scheduleId);

  if (!exists) {
    throw new HttpBadRequestError(`Schedule doesn't exist`);
  }

  await eventScheduler.updateEvent(scheduleId, {
    event: message ? { id: scheduleId, foo: message } : undefined,
    date: date ? new Date(date) : undefined
  });

  await updateEvent(eventDb, {
    id: scheduleId,
    date
  });

  return {
    status: 200,
    body: {
      message: 'success'
    }
  };
}
