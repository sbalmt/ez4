import type { Arn } from '@ez4/aws-common';

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
  scheduleName: string;
  expression: string;
  timezone?: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type CreateResponse = {
  scheduleArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'scheduleName'>>;

export const createSchedule = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(ScheduleServiceName, request.scheduleName);

  const { scheduleName, description, enabled } = request;
  const { expression, timezone, startDate, endDate } = request;
  const { functionArn, roleArn } = request;

  const response = await client.send(
    new CreateScheduleCommand({
      Name: scheduleName,
      Description: description,
      ScheduleExpression: expression,
      ScheduleExpressionTimezone: timezone,
      State: enabled ? ScheduleState.ENABLED : ScheduleState.DISABLED,
      ...(startDate && { StartDate: new Date(startDate) }),
      ...(endDate && { EndDate: new Date(endDate) }),
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.OFF
      },
      Target: {
        Arn: functionArn,
        RoleArn: roleArn
      }
    })
  );

  const scheduleArn = response.ScheduleArn as Arn;

  return {
    scheduleArn
  };
};

export const updateSchedule = async (scheduleName: string, request: UpdateRequest) => {
  Logger.logUpdate(ScheduleServiceName, scheduleName);

  const { description, enabled } = request;
  const { expression, timezone, startDate, endDate } = request;
  const { functionArn, roleArn } = request;

  await client.send(
    new UpdateScheduleCommand({
      Name: scheduleName,
      Description: description,
      ScheduleExpression: expression,
      ScheduleExpressionTimezone: timezone,
      ...(startDate && { StartDate: new Date(startDate) }),
      ...(endDate && { EndDate: new Date(endDate) }),
      ...(enabled !== undefined && {
        State: enabled ? ScheduleState.ENABLED : ScheduleState.DISABLED
      }),
      FlexibleTimeWindow: {
        Mode: FlexibleTimeWindowMode.OFF
      },
      Target: {
        Arn: functionArn,
        RoleArn: roleArn
      }
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
