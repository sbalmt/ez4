import type { ConnectResourceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { MissingImportedProjectError } from '@ez4/project/library';
import { getServiceName } from '@ez4/project/library';
import { isTopicImport } from '@ez4/topic/library';

import { createTopic } from '../topic/service';
import { connectSubscriptions, prepareSubscriptions } from './subscription';
import { prepareLinkedClient } from './client';

export const prepareLinkedImports = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (!isTopicImport(service)) {
    return null;
  }

  const { project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  return prepareLinkedClient(context, service, imports[project]);
};

export const prepareImports = (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isTopicImport(service)) {
    return false;
  }

  const { reference, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const topicState = createTopic(state, {
    topicName: getServiceName(reference, imports[project]),
    fifoMode: !!service.fifoMode,
    import: true
  });

  context.setServiceState(topicState, service, options);

  prepareSubscriptions(state, service, topicState, options, context);

  return true;
};

export const connectImports = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isTopicImport(service)) {
    connectSubscriptions(state, service, options, context);
  }
};
