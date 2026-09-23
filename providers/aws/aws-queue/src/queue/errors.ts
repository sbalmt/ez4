export class InvalidQueueNameError extends Error {
  constructor(queueName: string, maxLength: number) {
    super(`Queue name ${queueName} exceeds ${maxLength} characters.`);
  }
}

export class QueueNotFoundError extends Error {
  constructor(queueName: string) {
    super(`Queue service ${queueName} wasn't found.`);
  }
}
