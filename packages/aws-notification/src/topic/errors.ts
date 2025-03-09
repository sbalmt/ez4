export class TopicNotFoundError extends Error {
  constructor(topicName: string) {
    super(`Notification service ${topicName} wasn't found.`);
  }
}
