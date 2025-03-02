import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

/**
 * Update schedule request.
 */
export declare class UpdateScheduleRequest implements Http.Request {
  parameters: {
    scheduleId: String.UUID;
  };
  body: {
    date?: String.DateTime;
    message?: string;
  };
}

/**
 * Update schedule response.
 */
export declare class UpdateScheduleResponse implements Http.Response {
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
  const { scheduleId } = request.parameters;
  const { date, message } = request.body;
  const { eventScheduler } = context;

  await eventScheduler.updateEvent(scheduleId, {
    event: message ? { foo: message } : undefined,
    date: date ? new Date(date) : undefined
  });

  return {
    status: 200,
    body: {
      message: 'success'
    }
  };
}
