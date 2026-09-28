export class InvalidGroupNameError extends Error {
  constructor(groupName: string, maxLength: number) {
    super(`Cron group name ${groupName} exceeds ${maxLength} characters.`);
  }
}
