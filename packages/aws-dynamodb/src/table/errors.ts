export class TableNotFoundError extends Error {
  constructor(topicName: string) {
    super(`Table service ${topicName} wasn't found.`);
  }
}
