import type { StepContext, StepHandler } from '@ez4/state';
import type { PermissionResult, PermissionState } from './types';

import { CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getFunctionAliasName } from '../function/utils';
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

const previewResource = (candidate: PermissionState, current: PermissionState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source, {
    exclude: {
      getPermission: true
    }
  });

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.fromService
  };
};

const replaceResource = async (candidate: PermissionState, current: PermissionState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(PermissionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: PermissionState, context: StepContext): Promise<PermissionResult> => {
  const { parameters } = candidate;
  const { fromService } = parameters;

  return OperationLogger.logExecution(PermissionServiceName, fromService, 'creation', async (logger) => {
    const functionName = getFunctionAliasName(PermissionServiceName, 'permission', context);
    const permission = await parameters.getPermission(context);

    const response = await createPermission(logger, {
      sourceArn: permission.sourceArn,
      principal: permission.principal,
      functionName
    });

    return {
      statementId: response.statementId,
      functionName
    };
  });
};

const updateResource = async (candidate: PermissionState, current: PermissionState, context: StepContext) => {
  const { result, parameters } = candidate;
  const { fromService } = parameters;

  return OperationLogger.logExecution(PermissionServiceName, fromService, 'updates', async (logger) => {
    if (!result) {
      throw new CorruptedResourceError(PermissionServiceName, 'permission');
    }

    const newFunctionName = getFunctionAliasName(PermissionServiceName, 'permission', context);
    const oldFunctionName = current.result?.functionName;

    if (newFunctionName === oldFunctionName) {
      return;
    }

    if (oldFunctionName && current.result?.statementId) {
      await deletePermission(logger, oldFunctionName, current.result.statementId);
    }

    const permission = await parameters.getPermission(context);

    const response = await createPermission(logger, {
      sourceArn: permission.sourceArn,
      principal: permission.principal,
      functionName: newFunctionName
    });

    return {
      statementId: response.statementId,
      functionName: newFunctionName
    };
  });
};

const deleteResource = async (current: PermissionState) => {
  const result = current.result;

  if (result) {
    const { functionName, statementId } = result;

    return OperationLogger.logExecution(PermissionServiceName, functionName, 'deletion', async (logger) => {
      await deletePermission(logger, functionName, statementId);
    });
  }
};
