export class TopicNotFoundError extends Error {
  constructor(topicName: string) {
    super(`Topic service ${topicName} wasn't found.`);
  }
}
