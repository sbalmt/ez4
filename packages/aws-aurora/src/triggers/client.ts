import type { ExtraSource, ServiceEvent } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';
import { isDatabaseService } from '@ez4/database/library';

import { getClusterStateId } from '../cluster/utils.js';
import { getClusterName, getDatabaseName } from './utils.js';
import { getRepository } from './repository.js';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isDatabaseService(service) || service.engine !== 'aurora') {
    return null;
  }

  const clusterName = getClusterName(service, options);
  const clusterId = getClusterStateId(clusterName);

  const database = getDatabaseName(service, options);
  const resourceArn = getDefinitionName(clusterId, 'clusterArn');
  const secretArn = getDefinitionName(clusterId, 'secretArn');

  const configuration = `{ database: "${database}", resourceArn: ${resourceArn}, secretArn: ${secretArn} }`;

  const repository = JSON.stringify(getRepository(service));

  return {
    entryId: clusterId,
    constructor: `make(${configuration}, ${repository}, ${options.debug ? 'true' : 'false'})`,
    from: '@ez4/aws-aurora/client',
    module: 'Client'
  };
};
