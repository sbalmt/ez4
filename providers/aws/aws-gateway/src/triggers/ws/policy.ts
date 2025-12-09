import type { PolicyResourceEvent } from '@ez4/project/library';

import { createPolicy, tryGetPolicy } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';
import { WsServiceType } from '@ez4/gateway/library';

import { getPolicyDocument } from '../../utils/policy';

export const prepareWsExecutionPolicy = async (event: PolicyResourceEvent) => {
  const { state, serviceType, options } = event;

  if (serviceType !== WsServiceType) {
    return null;
  }

  const policyName = `${getServiceName('', options)}-ws-policy`;

  return (
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      tags: options.tags,
      policyDocument: await getPolicyDocument(),
      policyName
    })
  );
};
