import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CertificateState, CertificateResult, CertificateParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
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

const previewResource = (candidate: CertificateState, current: CertificateState) => {
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

const createResource = (candidate: CertificateState): Promise<CertificateResult> => {
  const parameters = candidate.parameters;
  const domainName = parameters.domainName;

  return Logger.logOperation(CertificateServiceName, domainName, 'creation', async (logger) => {
    const { certificateArn } = await createCertificate(logger, parameters);

    return {
      certificateArn
    };
  });
};

const updateResource = (candidate: CertificateState, current: CertificateState): Promise<CertificateResult> => {
  const { result, parameters } = candidate;
  const { domainName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(CertificateServiceName, domainName);
  }

  return Logger.logOperation(CertificateServiceName, domainName, 'updates', async (logger) => {
    await checkTagUpdates(logger, result.certificateArn, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: CertificateState, context: StepContext) => {
  const { result, parameters } = current;

  if (!result || (!parameters.allowDeletion && !context.force)) {
    return;
  }

  const domainName = parameters.domainName;

  await Logger.logOperation(CertificateServiceName, domainName, 'deletion', async (logger) => {
    const isInUse = await isCertificateInUse(logger, result.certificateArn);

    if (!isInUse) {
      await deleteCertificate(result.certificateArn, logger);
    }
  });
};

const checkTagUpdates = async (
  logger: Logger.OperationLogger,
  certificateArn: Arn,
  candidate: CertificateParameters,
  current: CertificateParameters
) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagCertificate(logger, certificateArn, tags),
    (tags) => untagCertificate(logger, certificateArn, tags)
  );
};
