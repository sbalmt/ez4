import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { getJsonEvent, MalformedEventError } from '@ez4/scheduler/utils';
import { getErrorResponse, getSuccessResponse } from '@ez4/local-common';
import { isDynamicCronService } from '@ez4/scheduler/library';
import { getServiceName } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

import { processTimerEvent } from '../handlers/timer';
import { processSchedulerEvent } from '../handlers/scheduler';
import { InMemoryScheduler } from '../service/scheduler';
import { createServiceClient } from '../client/service';

export const registerCronEmulator = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const resourceName = service.name;

  return {
    type: 'Scheduler',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    exportHandler: () => {
      return service.schema ? createServiceClient(resourceName, service.schema) : undefined;
    },
    bootstrapHandler: () => {
      InMemoryScheduler.createScheduler(resourceName, {
        handler: (event) => processSchedulerEvent(service, options, context, event)
      });

      if (options.suppress) {
        return Logger.warn(`Scheduler [${resourceName}] is suppressed`);
      }

      if (isDynamicCronService(service)) {
        return Logger.log(`⌚ Dynamic scheduler [${resourceName}] is ready`);
      }

      processTimerEvent(service, options, context);
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleSchedulerRequest(service, options, context, request);
    },
    shutdownHandler: () => {
      InMemoryScheduler.deleteScheduler(resourceName);

      if (!options.suppress) {
        Logger.log(`⛔ Stopped scheduler [${resourceName}] events`);
      }
    }
  };
};

const handleSchedulerRequest = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorRequestEvent
) => {
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/') {
    throw new Error('Unsupported scheduler/cron request.');
  }

  try {
    if (service.schema && !body) {
      throw new MalformedEventError(['Event body is required.']);
    }

    if (!service.schema && body) {
      throw new MalformedEventError(['Event body is not required.']);
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

const handleSchedulerEvent = async (service: CronService, options: ServeOptions, context: EmulateServiceContext, body?: Buffer) => {
  if (service.schema && body) {
    const jsonEvent = JSON.parse(body.toString());
    const safeEvent = await getJsonEvent(jsonEvent, service.schema);

    return processSchedulerEvent(service, options, context, safeEvent);
  }

  await processSchedulerEvent(service, options, context, null);
};
