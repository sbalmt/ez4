export type TopicRemoteSubscription = {
  type: TopicEmulatorSubscriptionType.Remote;
  serviceName: string;
  serviceHost: string;
};

export const enum TopicEmulatorSubscriptionType {
  Remote = 'remote'
}
