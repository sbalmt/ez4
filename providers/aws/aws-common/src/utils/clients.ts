import { Agent } from 'node:https';

/**
 * Connection pool shared by every AWS client.
 *
 * Deploy clients are built per operation, and each one that builds its own handler also opens its
 * own socket, which keep-alive then holds until the process exits. A project with a few hundred
 * resources ends the deploy holding more than a thousand connections: fine against a datacenter
 * link, over the connection table of a home router, which starts refusing every new connection —
 * including the ones the deploy itself still needs.
 */
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
