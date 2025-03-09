export class ClusterNotFoundError extends Error {
  constructor(topicName: string) {
    super(`Database service ${topicName} wasn't found.`);
  }
}
