import type { Integer, String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { EventStatus } from '../../schemas/event.js';
import type { Api } from '../../api.js';

import { listEvents } from '../repository.js';

/**
 * List schedule request.
 */
export declare class ListScheduleRequest implements Http.Request {
  parameters: {
    /**
     * Page cursor.
     */
    cursor?: string;

    /**
     * Page limit.
     */
    limit?: Integer.Range<1, 10>;
  };
}

/**
 * List schedule response.
 */
export declare class ListScheduleResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Next page cursor.
     */
    next?: string;

    /**
     * List of schedules.
     */
    schedules: {
      /**
       * Event id.
       */
      id: string;

      /**
       * Event date.
       */
      date: String.DateTime;

      /**
       * Event status.
       */
      status: EventStatus;

      /**
       * Event creation date.
       */
      created_at: string;

      /**
       * Event last update date.
       */
      updated_at: string;
    }[];
  };
}

/**
 * Handle list schedules requests.
 */
export async function listScheduleHandler(
  request: ListScheduleRequest,
  context: Service.Context<Api>
): Promise<ListScheduleResponse> {
  const { cursor, limit } = request.parameters;
  const { eventDb } = context;

  const results = await listEvents(eventDb, {
    cursor,
    limit
  });

  return {
    status: 200,
    body: {
      next: results.cursor?.toString(),
      schedules: results.records
    }
  };
}
