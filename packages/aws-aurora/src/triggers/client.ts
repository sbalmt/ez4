import type { ExtraSource, ServiceEvent } from '@ez4/project/library';

import { getAccountId, getRegion } from '@ez4/aws-identity';
import { isDatabaseService } from '@ez4/database/library';

import { getClusterName } from './utils.js';
import { toCamelCase } from '@ez4/utils';

export const prepareLinkedService = async (event: ServiceEvent): Promise<ExtraSource | null> => {
  const { service, options } = event;

  if (!isDatabaseService(service) || service.engine !== 'aurora') {
    return null;
  }

  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const clusterName = getClusterName(service, options);
  const resourceArn = `arn:aws:rds:${region}:${accountId}:cluster:${clusterName}`;
  const secretArn = ``;

  const configuration = {
    database: toCamelCase(service.name),
    resourceArn,
    secretArn
  };

  const repository = service.tables.reduce((current, { name, schema }) => {
    return {
      ...current,
      [name]: {
        tableName: toCamelCase(name),
        tableSchema: schema
      }
    };
  }, {});

  return {
    constructor: `make(${JSON.stringify(configuration)}, ${JSON.stringify(repository)})`,
    module: 'Client',
    from: '@ez4/aws-aurora/client'
  };
};
