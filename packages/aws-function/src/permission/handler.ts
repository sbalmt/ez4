import type { StepContext, StepHandler } from '@ez4/stateful';
import type { PermissionResult, PermissionState } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';

import { getFunctionName } from '../function/utils.js';
import { createPermission, deletePermission } from './client.js';
import { PermissionServiceName } from './types.js';

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

const replaceResource = async (
  candidate: PermissionState,
  current: PermissionState,
  context: StepContext<PermissionState>
) => {
  if (current.result) {
    throw new ReplaceResourceError(PermissionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: PermissionState,
  context: StepContext<PermissionState>
): Promise<PermissionResult> => {
  const parameters = candidate.parameters;

  const functionName = getFunctionName(PermissionServiceName, 'permission', context);
  const permission = await parameters.getPermission(context);

  const response = await createPermission({
    functionName,
    principal: permission.principal,
    sourceArn: permission.sourceArn,
    action: 'lambda:InvokeFunction'
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
