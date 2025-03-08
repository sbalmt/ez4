import type { DeployOptions, ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';
import { DatabaseService } from '@ez4/database/library';

import { ClusterState } from '../cluster/types.js';
import { createClusterStateId } from '../cluster/utils.js';
import { getClusterName, getDatabaseName } from './utils.js';
import { getRepository } from './repository.js';

export const prepareLinkedClient = (service: DatabaseService, options: DeployOptions): ExtraSource => {
  const clusterName = getClusterName(service, options);
  const stateId = createClusterStateId(clusterName);

  const secretArn = getDefinitionName<ClusterState>(stateId, 'secretArn');
  const resourceArn = getDefinitionName<ClusterState>(stateId, 'clusterArn');
  const database = getDatabaseName(service, options);

  const configuration = `{ database: "${database}", resourceArn: ${resourceArn}, secretArn: ${secretArn} }`;

  const repository = JSON.stringify(getRepository(service));

  return {
    entryId: stateId,
    constructor: `make(${configuration}, ${repository}, ${options.debug})`,
    from: '@ez4/aws-aurora/client',
    module: 'Client'
  };
};
