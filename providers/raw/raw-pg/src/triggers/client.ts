import type { EmulateDescriptorEvent } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';

import { getTableRepository } from '@ez4/pgclient/library';

import { getConnectionOptions } from '../local/options';
import { isRawPgService } from './utils';

export const prepareEmulatorDescriptor = (event: EmulateDescriptorEvent) => {
  const { service, options } = event;

  if (!isRawPgService(service)) {
    return null;
  }

  return {
    name: 'makeService',
    module: '@ez4/raw-pg/worker',
    options: getEmulatorOptions(service, options)
  };
};

const getEmulatorOptions = (service: DatabaseService, options: EmulateDescriptorEvent['options']) => ({
  repository: getTableRepository(service.tables),
  connection: getConnectionOptions(service, options),
  debug: options.debug
});
