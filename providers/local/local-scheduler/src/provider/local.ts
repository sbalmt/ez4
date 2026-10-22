import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { HttpProviderRequest } from '@ez4/server';
import type { Client } from '@ez4/scheduler';
import type { ProviderSchedulerEvent } from '../types/events';

import { getJsonEvent, MalformedEventError } from '@ez4/scheduler/utils';
import { registerProvider as registerEmulatorProvider, unregisterProvider as unregisterEmulatorProvider } from '@ez4/emulator';
import {
  getErrorResponse,
  getSuccessResponse,
  ProviderType,
  registerProvider as registerServerProvider,
  unregisterProvider as unregisterServerProvider
} from '@ez4/server';
import { isDynamicCronService } from '@ez4/scheduler/library';
import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

import { processTimerEvent } from '../handlers/timer';
import { processSchedulerEvent } from '../handlers/scheduler';
import { createServiceClient } from '../client/service';
import { InMemoryScheduler } from '../service/scheduler';
import { CronManifest } from '../service/manifest';
import { getScheduleEvent } from '../utils/event';
import { ProviderEvent } from '../types/events';

export const registerLocalService = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: resourceName, schema } = service;

  const identifier = getServiceName(resourceName, options);
  const provider = `scheduler:${identifier}`;

  return {
    type: 'Scheduler',
    name: resourceName,
    options: service.options,
    identifier,
    exportDescriptor: () => {
      return {
        name: 'makeService',
        module: '@ez4/local-scheduler/worker',
        provider,
        options: {
          name: resourceName,
          schema
        }
      };
    },
    bootstrapHandler: () => {
      InMemoryScheduler.createScheduler(resourceName, {
        handler: (event) => processSchedulerEvent(service, options, context, event)
      });

      const client = schema ? createServiceClient(resourceName, schema) : undefined;

      registerEmulatorProvider(provider, {
        eventTypes: [
          ProviderEvent.GetEvent,
          ProviderEvent.SetEvent,
          ProviderEvent.CreateEvent,
          ProviderEvent.UpdateEvent,
          ProviderEvent.DeleteEvent
        ],
        eventHandler: (event: string, payload: ProviderSchedulerEvent | undefined) => {
          return handleClientEvent(resourceName, client, event, payload);
        }
      });

      registerServerProvider(identifier, {
        type: ProviderType.Http,
        requestHandler: (request) => {
          return handleSchedulerRequest(service, options, context, request);
        }
      });

      if (options.suppress) {
        return Logger.warn(`Scheduler [${resourceName}] is suppressed`);
      }

      if (isDynamicCronService(service)) {
        return Logger.log(`⌚ Dynamic scheduler [${resourceName}] is ready`);
      }

      processTimerEvent(service, options, context);
    },
    manifestHandler: () => {
      return CronManifest.build(service);
    },
    shutdownHandler: () => {
      InMemoryScheduler.deleteScheduler(resourceName);
      unregisterServerProvider(identifier);
      unregisterEmulatorProvider(provider);

      if (!options.suppress) {
        Logger.log(`⛔ Stopped scheduler [${resourceName}] events`);
      }
    }
  };
};

const handleClientEvent = (resourceName: string, client: Client<any> | undefined, event: string, payload?: ProviderSchedulerEvent) => {
  if (!client) {
    throw new Error(`Scheduler [${resourceName}] has no client.`);
  }

  if (!payload) {
    throw new Error('Missing scheduler event payload.');
  }

  const { identifier, input = {} } = payload;

  switch (event) {
    case ProviderEvent.GetEvent:
      return client.getEvent(identifier);

    case ProviderEvent.SetEvent:
      return client.setEvent(identifier, getScheduleEvent(input));

    case ProviderEvent.CreateEvent:
      return client.createEvent(identifier, getScheduleEvent(input));

    case ProviderEvent.UpdateEvent:
      return client.updateEvent(identifier, getScheduleEvent(input));

    case ProviderEvent.DeleteEvent:
      return client.deleteEvent(identifier);
  }

  throw new Error(`Unsupported scheduler event ${event}.`);
};

const handleSchedulerRequest = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: HttpProviderRequest
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/') {
    throw new Error('Unsupported scheduler/cron request.');
  }

  try {
    if (service.schema && !body) {
      throw new Error('Event body is required.');
    }

    if (!service.schema && body) {
      throw new Error('Event body is not required.');
    }

    await handleSchedulerEvent(service, options, context, body);

    return getSuccessResponse(201);
    //
  } catch (error) {
    if (!(error instanceof MalformedEventError)) {
      throw error;
    }

    return getErrorResponse(400, {
      message: error.message,
      context: error.context
    });
  }
};

const handleSchedulerEvent = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  body?: Buffer | string
) => {
  if (service.schema && body) {
    const jsonEvent = JSON.parse(body.toString());
    const safeEvent = await getJsonEvent(jsonEvent, service.schema);

    return processSchedulerEvent(service, options, context, safeEvent);
  }

  await processSchedulerEvent(service, options, context, null);
};
