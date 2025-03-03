import type { EntryState, StepContext } from '@ez4/stateful';
import type { CertificateState } from './types.js';

import { IncompleteResourceError } from '@ez4/aws-common';
import { hashData, toKebabCase } from '@ez4/utils';

import { CertificateServiceType } from './types.js';

export const isCertificateState = (resource: EntryState): resource is CertificateState => {
  return resource.type === CertificateServiceType;
};

export const getCertificateStateId = (bucketName: string) => {
  return hashData(CertificateServiceType, toKebabCase(bucketName));
};

export const tryGetCertificateArn = (context: StepContext) => {
  const resources = context.getDependencies<CertificateState>(CertificateServiceType);

  return resources[0]?.result?.certificateArn;
};

export const getCertificateArn = (
  serviceName: string,
  resourceId: string,
  context: StepContext
) => {
  const certificateArn = tryGetCertificateArn(context);

  if (!certificateArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'certificateArn');
  }

  return certificateArn;
};
