import type { EmulateServiceContext, EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { getJsonEvent, MalformedEventError } from '@ez4/scheduler/utils';
import { getResponseError, getResponseSuccess } from '@ez4/local-common';
import { isDynamicCronService } from '@ez4/scheduler/library';
import { getServiceName, Logger } from '@ez4/project/library';

import { processTimerEvent } from '../handlers/timer';
import { processSchedulerEvent } from '../handlers/scheduler';
import { InMemoryScheduler } from '../service/scheduler';
import { createServiceClient } from '../client/service';

export const registerCronEmulator = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const serviceName = service.name;

  return {
    type: 'Scheduler',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return service.schema ? createServiceClient(serviceName, service.schema) : undefined;
    },
    bootstrapHandler: () => {
      InMemoryScheduler.createScheduler(serviceName, {
        handler: (event) => processSchedulerEvent(service, options, context, event)
      });

      if (!options.test) {
        if (isDynamicCronService(service)) {
          return Logger.log(`⌚ Dynamic scheduler [${serviceName}] is ready`);
        }

        processTimerEvent(service, options, context);
      }
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleSchedulerRequest(service, options, context, request);
    },
    shutdownHandler: () => {
      InMemoryScheduler.deleteScheduler(serviceName);

      if (!options.test) {
        Logger.log(`⛔ Stopped scheduler [${serviceName}] events`);
      }
    }
  };
};

const handleSchedulerRequest = async (
  service: CronService,
  options: ServeOptions,
  context: EmulateServiceContext,
  request: EmulatorServiceRequest
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

    return getResponseSuccess(201);
    //
  } catch (error) {
    if (!(error instanceof MalformedEventError)) {
      throw error;
    }

    return getResponseError(400, {
      message: error.message,
      details: error.details
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
