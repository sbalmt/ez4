import type { ResourceOutputEvent } from '@ez4/project/library';

import { isDistributionState } from '../distribution/utils';

export const resourceOutput = (event: ResourceOutputEvent) => {
  const { service } = event;

  if (!isDistributionState(service)) {
    return null;
  }

  const { parameters, result } = service;

  if (!result) {
    return null;
  }

  const { distributionName, description, aliases } = parameters;

  const domains = [result.endpoint, ...(aliases ?? [])];

  return {
    label: description ?? distributionName,
    value: domains.map((domain) => `https://${domain}`).join(' - ')
  };
};
