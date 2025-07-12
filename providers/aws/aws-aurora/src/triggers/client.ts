import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';
import { getTableRepository } from '@ez4/pgclient/library';
import { DatabaseService } from '@ez4/database/library';

import { ClusterState } from '../cluster/types.js';
import { getClusterState } from '../cluster/utils.js';
import { getDatabaseName } from './utils.js';

export const prepareLinkedClient = (context: EventContext, service: DatabaseService, options: DeployOptions): ExtraSource => {
  const clusterState = getClusterState(context, service.name, options);
  const clusterId = clusterState.entryId;

  const secretArn = getDefinitionName<ClusterState>(clusterId, 'secretArn');
  const resourceArn = getDefinitionName<ClusterState>(clusterId, 'clusterArn');
  const database = getDatabaseName(service, options);

  const connection = `{ database: "${database}", resourceArn: ${resourceArn}, secretArn: ${secretArn} }`;

  const repository = JSON.stringify(getTableRepository(service));

  const settings = JSON.stringify({
    debug: options.debug
  });

  return {
    entryIds: [clusterId],
    constructor: `make(${connection}, ${repository}, ${settings})`,
    from: '@ez4/aws-aurora/client',
    module: 'Client'
  };
};
