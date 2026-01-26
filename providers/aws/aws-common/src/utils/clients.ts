export const getAwsClientOptions = () => {
  return {
    userAgentAppId: 'EZ4',
    retryMode: 'adaptive',
    maxAttempts: 10
  };
};

export const getAwsClientWaiter = () => {
  return {
    maxWaitTime: 3600,
    maxDelay: 10,
    minDelay: 2
  };
};
