import type { StepContext, StepHandler } from '@ez4/stateful';
import type { FunctionState, FunctionResult } from './types';

import { CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { createFunction, deleteFunction, importFunction, updateFunction } from './client';
import { FunctionServiceName } from './types';
import { readFile } from 'node:fs/promises';

export const getFunctionHandler = (): StepHandler<FunctionState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: FunctionState, current: FunctionState) => {
  return !!candidate.result && candidate.result.functionArn === current.result?.functionArn;
};

const previewResource = (candidate: FunctionState, current: FunctionState) => {
  const target = candidate.parameters;
  const source = current.parameters;

  const changes = deepCompare(
    {
      ...target,
      valuesHash: target.getFunctionHash()
    },
    {
      ...source,
      valuesHash: current.result?.valuesHash
    }
  );

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.functionName
  };
};

const replaceResource = (candidate: FunctionState, current: FunctionState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(FunctionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: FunctionState, context: StepContext): Promise<FunctionResult> => {
  const { functionName, ...parameters } = candidate.parameters;

  return OperationLogger.logExecution(FunctionServiceName, functionName, 'creation', async (logger) => {
    const importedFunction = await importFunction(logger, functionName);

    const [sourceFile, valuesHash] = await Promise.all([parameters.getFunctionBundle(context), parameters.getFunctionHash()]);

    const functionCode = await readFile(sourceFile);

    if (importedFunction) {
      await updateFunction(logger, functionName, {
        ...parameters,
        functionCode
      });

      return {
        functionArn: importedFunction.functionArn,

        valuesHash
      };
    }

    const { functionArn } = await createFunction(logger, {
      ...parameters,
      functionName,
      functionCode
    });

    return {
      functionArn,

      valuesHash
    };
  });
};

const updateResource = (candidate: FunctionState, _current: FunctionState, context: StepContext): Promise<FunctionResult> => {
  const { parameters, result } = candidate;
  const { functionName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(FunctionServiceName, functionName);
  }

  return OperationLogger.logExecution(FunctionServiceName, functionName, 'updates', async (logger) => {
    const [sourceFile, valuesHash] = await Promise.all([parameters.getFunctionBundle(context), parameters.getFunctionHash()]);

    const functionCode = await readFile(sourceFile);

    await updateFunction(logger, functionName, {
      ...parameters,
      functionCode
    });

    return {
      ...result,
      valuesHash
    };
  });
};

const deleteResource = async (current: FunctionState) => {
  const { result, parameters } = current;

  if (result) {
    const { functionName } = parameters;

    await OperationLogger.logExecution(FunctionServiceName, functionName, 'deletion', async (logger) => {
      await deleteFunction(logger, functionName);
    });
  }
};
