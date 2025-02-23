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

export const getCertificateArn = (
  serviceName: string,
  resourceId: string,
  context: StepContext
) => {
  const resource = context.getDependencies<CertificateState>(CertificateServiceType).at(0)?.result;

  if (!resource?.certificateArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'certificateArn');
  }

  return resource.certificateArn;
};
