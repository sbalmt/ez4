export class InvalidScheduleNameError extends Error {
  constructor(scheduleName: string, maxLength: number) {
    super(`Cron name ${scheduleName} exceeds ${maxLength} characters.`);
  }
}

export class ScheduleNotFoundError extends Error {
  constructor(scheduleName: string) {
    super(`Cron service ${scheduleName} wasn't found.`);
  }
}

export class ScheduleTargetNotFoundError extends Error {
  constructor(targetName: string) {
    super(`Cron service target ${targetName} wasn't found.`);
  }
}
