export class ScheduleNotFoundError extends Error {
  constructor(queueName: string) {
    super(`Cron service ${queueName} wasn't found.`);
  }
}
