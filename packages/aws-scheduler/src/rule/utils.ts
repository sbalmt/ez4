import type { EntryState, StepContext } from '@ez4/stateful';
import type { RuleState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';

import { RuleServiceType } from './types.js';

export const getRuleName = <E extends EntryState>(
  serviceName: string,
  resourceId: string,
  context: StepContext<E | RuleState>
) => {
  const resource = context.getDependencies(RuleServiceType).at(0);

  if (!resource?.parameters.ruleName) {
    throw new IncompleteResourceError(serviceName, resourceId, 'ruleArn');
  }

  return resource.parameters.ruleName;
};
