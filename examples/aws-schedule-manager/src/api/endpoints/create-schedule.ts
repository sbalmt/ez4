import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { EventStatus } from '../../schemas/event.js';
import { createEvent } from '../repository.js';

/**
 * Create schedule request.
 */
declare class CreateScheduleRequest implements Http.Request {
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
 * Create schedule response.
 */
declare class CreateScheduleResponse implements Http.Response {
  status: 201;

  body: {
    id: string;
  };
}

/**
 * Handle create schedule requests.
 */
export async function createScheduleHandler(
  request: CreateScheduleRequest,
  context: Service.Context<Api>
): Promise<CreateScheduleResponse> {
  const { eventDb, eventScheduler } = context;
  const { date, message } = request.body;

  const identifier = await createEvent(eventDb, {
    status: EventStatus.Pending,
    date
  });

  await eventScheduler.createEvent(identifier, {
    date: new Date(date),
    event: {
      id: identifier,
      foo: message
    }
  });

  return {
    status: 201,
    body: {
      id: identifier
    }
  };
}
