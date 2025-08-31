import { InvalidParameterError, isArn, parseArn } from '@ez4/aws-common';
import { SubscriptionProtocol } from '../client.js';

export const getSubscriptionProtocol = (serviceName: string, endpoint: string) => {
  if (!isArn(endpoint)) {
    throw new InvalidParameterError(serviceName, `endpoint ${endpoint} is not supported.`);
  }

  const { service } = parseArn(endpoint);

  switch (service) {
    case SubscriptionProtocol.Lambda:
    case SubscriptionProtocol.SQS:
      return service;
  }

  throw new InvalidParameterError(serviceName, `protocol ${service} is not supported.`);
};
