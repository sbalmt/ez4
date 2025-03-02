import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { HttpBadRequestError } from '@ez4/gateway';

import { deleteEvent } from '../repository.js';

/**
 * Delete schedule request.
 */
export declare class DeleteScheduleRequest implements Http.Request {
  parameters: {
    scheduleId: String.UUID;
  };
}

/**
 * Delete schedule response.
 */
export declare class DeleteScheduleResponse implements Http.Response {
  status: 204;
}

/**
 * Handle delete schedule requests.
 */
export async function deleteScheduleHandler(
  request: DeleteScheduleRequest,
  context: Service.Context<Api>
): Promise<DeleteScheduleResponse> {
  const { eventDb, eventScheduler } = context;
  const { scheduleId } = request.parameters;

  const exists = await eventScheduler.getEvent(scheduleId);

  if (!exists) {
    throw new HttpBadRequestError(`Schedule doesn't exist`);
  }

  await eventScheduler.deleteEvent(scheduleId);

  await deleteEvent(eventDb, scheduleId);

  return {
    status: 204
  };
}
