export type TopicServiceSubscribeRequest = {
  serviceHost: string;
  resourceName: string;
};

export type TopicServiceUnsubscribeRequest = {
  resourceName: string;
};

export const subscribeToTopicService = (topicHost: string, request: TopicServiceSubscribeRequest) => {
  return sendTopicServiceRequest(`${topicHost}/subscribe`, JSON.stringify(request));
};

export const unsubscribeFromTopicService = (topicHost: string, request: TopicServiceUnsubscribeRequest) => {
  return sendTopicServiceRequest(`${topicHost}/unsubscribe`, JSON.stringify(request));
};

export const getTopicServiceHost = (serviceHost: string, topicIdentifier: string) => {
  return `http://${serviceHost}/${topicIdentifier}`;
};

export const sendTopicServiceRequest = async (serviceHost: string, request: string) => {
  const response = await fetch(serviceHost, {
    method: 'POST',
    body: request,
    headers: {
      ['content-type']: 'application/json'
    }
  });

  if (!response.ok) {
    const { message } = await response.json();

    throw new Error(message);
  }
};
