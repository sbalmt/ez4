import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CertificateState, CertificateResult, CertificateParameters } from './types';

import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { isCertificateInUse, createCertificate, deleteCertificate, tagCertificate, untagCertificate } from './client';
import { CertificateServiceName } from './types';

export const getCertificateHandler = (): StepHandler<CertificateState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: CertificateState, current: CertificateState) => {
  return !!candidate.result && candidate.result.certificateArn === current.result?.certificateArn;
};

const previewResource = async (candidate: CertificateState, current: CertificateState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.domainName
  };
};

const replaceResource = async (candidate: CertificateState, current: CertificateState) => {
  if (current.result) {
    throw new ReplaceResourceError(CertificateServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: CertificateState): Promise<CertificateResult> => {
  const parameters = candidate.parameters;

  const { certificateArn } = await createCertificate(parameters);

  return {
    certificateArn
  };
};

const updateResource = async (candidate: CertificateState, current: CertificateState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const certificateArn = result.certificateArn;

  await checkTagUpdates(certificateArn, parameters, current.parameters);
};

const deleteResource = async (candidate: CertificateState, context: StepContext) => {
  const { result, parameters } = candidate;

  if (!result || (!parameters.allowDeletion && !context.force)) {
    return;
  }

  const isInUse = await isCertificateInUse(result.certificateArn);

  if (!isInUse) {
    await deleteCertificate(result.certificateArn);
  }
};

const checkTagUpdates = async (certificateArn: Arn, candidate: CertificateParameters, current: CertificateParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagCertificate(certificateArn, tags),
    (tags) => untagCertificate(certificateArn, tags)
  );
};
