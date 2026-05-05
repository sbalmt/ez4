import type { DeployOptions } from '@ez4/project/library';
import type { CdnService } from '@ez4/distribution/library';
import type { EntryStates } from '@ez4/stateful';

import { getServiceName } from '@ez4/project/library';
import { hashObject, isEmptyObject } from '@ez4/utils';

import { bundleViewerFunction } from '../function/helpers/bundler';
import { createViewerFunction } from '../function/service';

export const prepareRewrites = (state: EntryStates, service: CdnService, options: DeployOptions) => {
  const rewritePaths = [service.defaultOrigin, ...(service.origins ?? [])].reduce((paths, origin) => {
    return {
      ...paths,
      ...origin.rewrite
    };
  }, {});

  if (isEmptyObject(rewritePaths)) {
    return undefined;
  }

  const distributionName = getServiceName(service, options);
  const functionName = `${distributionName}-rewrite`;

  return createViewerFunction(state, {
    description: 'URL rewrite handler (EZ4 built-in)',
    functionName,
    getFunctionBundle: () => {
      return bundleViewerFunction({
        templateFile: 'rewrite.ts',
        functionName,
        define: {
          __EZ4_REWRITE_PATHS: JSON.stringify(rewritePaths)
        }
      });
    },
    getFunctionHash: () => {
      return hashObject({
        rewritePaths
      });
    }
  });
};
