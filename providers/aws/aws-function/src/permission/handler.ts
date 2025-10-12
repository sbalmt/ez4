import type { StepContext, StepHandler } from '@ez4/stateful';
import type { PermissionResult, PermissionState } from './types';

import { ReplaceResourceError } from '@ez4/aws-common';

import { getFunctionName } from '../function/utils';
import { createPermission, deletePermission } from './client';
import { PermissionServiceName } from './types';

export const getPermissionHandler = (): StepHandler<PermissionState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: PermissionState, current: PermissionState) => {
  return !!candidate.result && candidate.result.functionName === current.result?.functionName;
};

const previewResource = async (_candidate: PermissionState, _current: PermissionState) => {
  // Permission is generated dynamically, no changes to compare.
  return undefined;
};

const replaceResource = async (candidate: PermissionState, current: PermissionState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(PermissionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: PermissionState, context: StepContext): Promise<PermissionResult> => {
  const parameters = candidate.parameters;

  const functionName = getFunctionName(PermissionServiceName, 'permission', context);
  const permission = await parameters.getPermission(context);

  const response = await createPermission({
    action: 'lambda:InvokeFunction',
    sourceArn: permission.sourceArn,
    principal: permission.principal,
    functionName
  });

  return {
    statementId: response.statementId,
    functionName
  };
};

const updateResource = async () => {};

const deleteResource = async (candidate: PermissionState) => {
  const result = candidate.result;

  if (result) {
    await deletePermission(result.functionName, result.statementId);
  }
};
