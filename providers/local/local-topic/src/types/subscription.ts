export type TopicRemoteSubscription = {
  type: TopicEmulatorSubscriptionType.Remote;
  resourceName: string;
  serviceHost: string;
};

export const enum TopicEmulatorSubscriptionType {
  Remote = 'remote'
}
