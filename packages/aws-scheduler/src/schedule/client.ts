import type { Arn } from '@ez4/aws-common';
import type { CreateScheduleInput, UpdateScheduleInput } from '@aws-sdk/client-scheduler';

import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  FlexibleTimeWindowMode,
  SchedulerClient,
  ScheduleState,
  UpdateScheduleCommand
} from '@aws-sdk/client-scheduler';

import { Logger } from '@ez4/aws-common';
import { ScheduleServiceName } from './types.js';

const client = new SchedulerClient({});

export type CreateRequest = {
  roleArn: Arn;
  functionArn: Arn;
  groupName?: string;
  scheduleName: string;
  expression: string;
  timezone?: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  maxRetryAttempts?: number;
  maxEventAge?: number;
  description?: string;
};

export type CreateResponse = {
  scheduleArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'scheduleName'>>;

export const createSchedule = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(ScheduleServiceName, request.scheduleName);

  const response = await client.send(
    new CreateScheduleCommand({
      Name: request.scheduleName,
      ...upsertScheduleRequest(request)
    })
  );

  const scheduleArn = response.ScheduleArn as Arn;

  return {
    scheduleArn
  };
};

export const updateSchedule = async (scheduleName: string, request: UpdateRequest) => {
  Logger.logUpdate(ScheduleServiceName, scheduleName);

  await client.send(
    new UpdateScheduleCommand({
      Name: scheduleName,
      ...upsertScheduleRequest(request)
    })
  );
};

export const deleteSchedule = async (scheduleName: string) => {
  Logger.logDelete(ScheduleServiceName, scheduleName);

  await client.send(
    new DeleteScheduleCommand({
      Name: scheduleName
    })
  );
};

const upsertScheduleRequest = (
  request: CreateRequest | UpdateRequest
): Omit<CreateScheduleInput | UpdateScheduleInput, 'Name'> => {
  const { startDate, endDate, maxRetryAttempts, maxEventAge, enabled } = request;

  const hasMaxRetryAttempts = maxRetryAttempts !== undefined;

  const hasMaxEventAge = maxEventAge !== undefined;

  const hasRetryPolicy = hasMaxEventAge || hasMaxRetryAttempts;

  return {
    GroupName: request.groupName,
    Description: request.description,
    ScheduleExpression: request.expression,
    ScheduleExpressionTimezone: request.timezone,
    ...(startDate && { StartDate: new Date(startDate) }),
    ...(endDate && { EndDate: new Date(endDate) }),
    ...(enabled !== undefined && {
      State: enabled ? ScheduleState.ENABLED : ScheduleState.DISABLED
    }),
    FlexibleTimeWindow: {
      Mode: FlexibleTimeWindowMode.OFF
    },
    Target: {
      Arn: request.functionArn,
      RoleArn: request.roleArn,
      ...(hasRetryPolicy && {
        RetryPolicy: {
          ...(hasMaxEventAge && { MaximumEventAgeInSeconds: maxEventAge }),
          ...(hasMaxRetryAttempts && { MaximumRetryAttempts: maxRetryAttempts })
        }
      })
    }
  };
};
