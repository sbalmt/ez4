import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { HttpNotFoundError } from '@ez4/gateway';

/**
 * Read schedule request.
 */
declare class ReadScheduleRequest implements Http.Request {
  parameters: {
    scheduleId: String.UUID;
  };
}

/**
 * Read schedule response.
 */
declare class ReadScheduleResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Event date.
     */
    date: String.DateTime;

    /**
     * Event message.
     */
    message: string;
  };
}

/**
 * Handle read schedule requests.
 */
export async function readScheduleHandler(request: ReadScheduleRequest, context: Service.Context<Api>): Promise<ReadScheduleResponse> {
  const { scheduleId } = request.parameters;
  const { eventScheduler } = context;

  const result = await eventScheduler.getEvent(scheduleId);

  if (!result) {
    throw new HttpNotFoundError('Schedule not found.');
  }

  return {
    status: 200,
    body: {
      date: result.date.toISOString(),
      message: result.event.foo
    }
  };
}
