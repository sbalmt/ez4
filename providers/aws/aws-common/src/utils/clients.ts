import { Agent } from 'node:https';

const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 64
});

export const getAwsClientOptions = () => {
  return {
    userAgentAppId: 'EZ4',
    retryMode: 'adaptive',
    maxAttempts: 10,
    requestHandler: {
      httpsAgent
    }
  };
};

export const getAwsClientWaiter = () => {
  return {
    maxWaitTime: 3600,
    maxDelay: 10,
    minDelay: 2
  };
};
