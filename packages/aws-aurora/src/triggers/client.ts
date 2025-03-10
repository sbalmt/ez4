import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';
import { DatabaseService } from '@ez4/database/library';

import { ClusterState } from '../cluster/types.js';
import { getClusterState } from '../cluster/utils.js';
import { getRepository } from './repository.js';
import { getDatabaseName } from './utils.js';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ExtraSource => {
  const clusterState = getClusterState(context, service.name, options);
  const clusterId = clusterState.entryId;

  const secretArn = getDefinitionName<ClusterState>(clusterId, 'secretArn');
  const resourceArn = getDefinitionName<ClusterState>(clusterId, 'clusterArn');
  const database = getDatabaseName(service, options);

  const configuration = `{ database: "${database}", resourceArn: ${resourceArn}, secretArn: ${secretArn} }`;

  const repository = JSON.stringify(getRepository(service));

  return {
    entryIds: [clusterId],
    constructor: `make(${configuration}, ${repository}, ${options.debug})`,
    from: '@ez4/aws-aurora/client',
    module: 'Client'
  };
};
