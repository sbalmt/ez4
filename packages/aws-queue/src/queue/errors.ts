export class QueueNotFoundError extends Error {
  constructor(queueName: string) {
    super(`Queue service ${queueName} wasn't found.`);
  }
}
