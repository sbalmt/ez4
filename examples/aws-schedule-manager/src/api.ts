import type { Http } from '@ez4/gateway';
import type { Environment, ServiceArchitecture } from '@ez4/common';
import type { createScheduleHandler } from '@/api/endpoints/create-schedule';
import type { readScheduleHandler } from '@/api/endpoints/read-schedule';
import type { updateScheduleHandler } from '@/api/endpoints/update-schedule';
import type { deleteScheduleHandler } from '@/api/endpoints/delete-schedule';
import type { listSchedulesHandler } from '@/api/endpoints/list-schedules';
import type { StatsServiceFactory } from '@/api/services/stats';
import type { DateValidation } from '@/api/validations/date';
import type { DateInUseError } from '@/api/errors/date';
import type { EventScheduler } from '@/scheduler';
import type { EventDb } from '@/dynamo';

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
    Http.UseRoute<{
      path: 'POST /create-schedule';
      handler: typeof createScheduleHandler;
    }>,
    Http.UseRoute<{
      path: 'GET /read-schedule/{scheduleId}';
      handler: typeof readScheduleHandler;
    }>,
    Http.UseRoute<{
      path: 'PATCH /update-schedule/{scheduleId}';
      handler: typeof updateScheduleHandler;
    }>,
    Http.UseRoute<{
      path: 'DELETE /delete-schedule/{scheduleId}';
      handler: typeof deleteScheduleHandler;
    }>,
    Http.UseRoute<{
      path: 'GET /list-schedules';
      handler: typeof listSchedulesHandler;
    }>
  ];

  /**
   * Default configurations for the API.
   */
  defaults: Http.UseDefaults<{
    /**
     * User ARM64 architecture.
     */
    architecture: ServiceArchitecture.Arm;

    /**
     * Mapped HTTP exceptions.
     */
    httpErrors: {
      [409]: [DateInUseError];
    };
  }>;

  /**
   * All API services.
   */
  services: {
    dateValidation: Environment.Service<DateValidation>;
    statsService: Environment.Service<StatsServiceFactory>;
    eventScheduler: Environment.Service<EventScheduler>;
    eventDb: Environment.Service<EventDb>;
  };
}
