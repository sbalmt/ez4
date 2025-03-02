import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

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
  status: 200;

  body: {
    message: string;
  };
}

/**
 * Handle delete schedule requests.
 */
export async function deleteScheduleHandler(
  request: DeleteScheduleRequest,
  context: Service.Context<Api>
): Promise<DeleteScheduleResponse> {
  const { scheduleId } = request.parameters;
  const { eventScheduler } = context;

  await eventScheduler.deleteEvent(scheduleId);

  return {
    status: 200,
    body: {
      message: 'success'
    }
  };
}
