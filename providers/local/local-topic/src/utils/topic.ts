export const getTopicServiceHost = (serviceHost: string, topicIdentifier: string) => {
  return `http://${serviceHost}/${topicIdentifier}`;
};

export const sendTopicServiceRequest = async (serviceHost: string, payload: string) => {
  const response = await fetch(serviceHost, {
    method: 'POST',
    body: payload,
    headers: {
      ['content-type']: 'application/json'
    }
  });

  if (!response.ok) {
    const { message } = await response.json();

    throw new Error(message);
  }
};
