export class InvalidTopicNameError extends Error {
  constructor(topicName: string, maxLength: number) {
    super(`Topic name ${topicName} exceeds ${maxLength} characters.`);
  }
}

export class TopicNotFoundError extends Error {
  constructor(topicName: string) {
    super(`Topic service ${topicName} wasn't found.`);
  }
}
