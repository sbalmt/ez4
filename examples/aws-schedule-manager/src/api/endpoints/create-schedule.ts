import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { Api } from '../../api.js';

import { randomUUID } from 'node:crypto';

/**
 * Create schedule request.
 */
export declare class CreateScheduleRequest implements Http.Request {
  body: {
    date: String.DateTime;
    message: string;
  };
}

/**
 * Create schedule response.
 */
export declare class CreateScheduleResponse implements Http.Response {
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
  const { date, message } = request.body;
  const { eventScheduler } = context;

  const identifier = randomUUID();

  await eventScheduler.createEvent(identifier, {
    date: new Date(date),
    event: {
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
