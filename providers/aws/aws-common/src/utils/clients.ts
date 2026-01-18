export const getAwsClientOptions = () => {
  return {
    userAgentAppId: 'EZ4',
    retryMode: 'adaptive',
    maxAttempts: 10
  };
};
