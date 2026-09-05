import type { StepContext, StepHandler } from '@ez4/state';
import type { IntegrityState, IntegrityResult } from './types';

import { CorruptedResourceError, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { getCreateQueries, getUpdateStepQueries } from '@ez4/pgmigration';
import { deepCompare, hashObject } from '@ez4/utils';

import { getMigrationResult } from '../migration/utils';
import { IntegrityServiceName } from './types';
import { validateChanges } from './client';

export const getIntegrityHandler = (): StepHandler<IntegrityState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: IntegrityState, current: IntegrityState) => {
  return !!candidate.result && candidate.parameters.getDatabase() === current.result?.database;
};

const previewResource = (candidate: IntegrityState, current: IntegrityState) => {
  const target = candidate.parameters;
  const source = current.parameters;

  const changes = deepCompare(
    {
      ...target,
      rollout: true,
      dependencies: candidate.dependencies,
      integrityHash: hashObject(target.getRepository())
    },
    {
      ...source,
      rollout: !current.partial,
      dependencies: current.dependencies,
      integrityHash: current.result?.integrityHash
    }
  );

  return {
    ...changes,
    name: target.getDatabase()
  };
};

const replaceResource = async (candidate: IntegrityState, current: IntegrityState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(IntegrityServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: IntegrityState, context: StepContext): Promise<IntegrityResult> => {
  const { parameters } = candidate;

  const database = parameters.getDatabase();

  return OperationLogger.logExecution(IntegrityServiceName, database, 'creation', async (logger) => {
    const { clusterArn, secretArn } = getMigrationResult(IntegrityServiceName, 'integrity', context);

    const repository = parameters.getRepository();
    const queries = getCreateQueries(repository);

    await validateChanges(logger, {
      queries: queries.validations,
      clusterArn,
      secretArn,
      database
    });

    return {
      integrityHash: hashObject(repository),
      database
    };
  });
};

const updateResource = (candidate: IntegrityState, current: IntegrityState, context: StepContext): Promise<IntegrityResult> => {
  const { result, parameters } = candidate;

  const database = parameters.getDatabase();

  return OperationLogger.logExecution(IntegrityServiceName, database, 'updates', () => {
    if (!result) {
      throw new CorruptedResourceError(IntegrityServiceName, database);
    }

    const { clusterArn, secretArn } = getMigrationResult(IntegrityServiceName, 'integrity', context);

    const repository = parameters.getRepository();

    const oldIntegrityHash = current.result?.integrityHash;
    const newIntegrityHash = hashObject(repository);

    const forceApply = current.partial || context.force;

    if (newIntegrityHash === oldIntegrityHash && !forceApply) {
      return result;
    }

    const steps = getUpdateStepQueries(repository, {});

    context.postAction(() =>
      OperationLogger.logExecution(IntegrityServiceName, database, 'rollout', async (logger) => {
        await validateChanges(logger, {
          queries: [...steps.create.validations, ...steps.create.validations],
          clusterArn,
          secretArn,
          database
        });

        context.postAction(() =>
          OperationLogger.logExecution(IntegrityServiceName, database, 'cleanup', async (logger) => {
            await validateChanges(logger, {
              queries: steps.delete.validations,
              clusterArn,
              secretArn,
              database
            });
          })
        );
      })
    );

    return {
      ...result,
      integrityHash: newIntegrityHash
    };
  });
};

const deleteResource = async () => {
  // There's no integrity check when deleting the database.
};
