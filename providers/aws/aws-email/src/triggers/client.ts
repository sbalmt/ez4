import type { ContextSource, DeployOptions, EventContext } from '@ez4/project/library';
import type { EmailService } from '@ez4/email/library';

import { getIdentityState } from '../identity/utils';

export const prepareLinkedClient = (context: EventContext, service: EmailService, options: DeployOptions): ContextSource => {
  const identityState = getIdentityState(context, service.name, options);
  const identityId = identityState.entryId;

  return {
    module: 'Client',
    from: '@ez4/aws-email/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make()`,
    connectionIds: [identityId],
    dependencyIds: [identityId]
  };
};
