import type { Cron, ScheduleEvent } from '@ez4/scheduler';

export const enum ProviderEvent {
  GetEvent = 'get-event',
  SetEvent = 'set-event',
  CreateEvent = 'create-event',
  UpdateEvent = 'update-event',
  DeleteEvent = 'delete-event'
}

export type ProviderSchedulerEvent = {
  input?: Partial<ScheduleEvent<Cron.Event>>;
  identifier: string;
};
