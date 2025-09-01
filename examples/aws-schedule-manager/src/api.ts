import type { Http } from '@ez4/gateway';
import type { Environment } from '@ez4/common';
import type { createScheduleHandler } from './api/endpoints/create-schedule';
import type { readScheduleHandler } from './api/endpoints/read-schedule';
import type { updateScheduleHandler } from './api/endpoints/update-schedule';
import type { deleteScheduleHandler } from './api/endpoints/delete-schedule';
import type { listSchedulesHandler } from './api/endpoints/list-schedules';
import type { EventScheduler } from './scheduler';
import type { EventDb } from './dynamo';

/**
 * Example of AWS API deployed with EZ4.
 */
export declare class Api extends Http.Service {
  /**
   * Display name for this API.
   */
  name: 'Scheduler Manager';

  /**
   * All API routes.
   */
  routes: [
    {
      path: 'POST /create-schedule';
      handler: typeof createScheduleHandler;
    },
    {
      path: 'GET /read-schedule/{scheduleId}';
      handler: typeof readScheduleHandler;
    },
    {
      path: 'PATCH /update-schedule/{scheduleId}';
      handler: typeof updateScheduleHandler;
    },
    {
      path: 'DELETE /delete-schedule/{scheduleId}';
      handler: typeof deleteScheduleHandler;
    },
    {
      path: 'GET /list-schedules';
      handler: typeof listSchedulesHandler;
    }
  ];

  /**
   * All API services.
   */
  services: {
    eventScheduler: Environment.Service<EventScheduler>;
    eventDb: Environment.Service<EventDb>;
  };
}
