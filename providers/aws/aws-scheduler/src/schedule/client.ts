import type { CreateScheduleInput, UpdateScheduleInput } from '@aws-sdk/client-scheduler';
import type { Arn, Logger } from '@ez4/aws-common';

import {
  CreateScheduleCommand,
  UpdateScheduleCommand,
  DeleteScheduleCommand,
  ResourceNotFoundException,
  FlexibleTimeWindowMode,
  ScheduleState
} from '@aws-sdk/client-scheduler';

import { isAnyBoolean, isAnyNumber } from '@ez4/utils';

import { getSchedulerClient } from '../utils/deploy';

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
  maxRetries?: number;
  maxAge?: number;
  description?: string;
};

export type CreateResponse = {
  scheduleArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'scheduleName'>>;

export const createSchedule = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating scheduler`);

  const response = await getSchedulerClient().send(
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

export const updateSchedule = async (logger: Logger.OperationLogger, scheduleName: string, request: UpdateRequest) => {
  logger.update(`Updating scheduler`);

  await getSchedulerClient().send(
    new UpdateScheduleCommand({
      Name: scheduleName,
      ...upsertScheduleRequest(request)
    })
  );
};

export const deleteSchedule = async (logger: Logger.OperationLogger, scheduleName: string) => {
  logger.update(`Deleting scheduler`);

  try {
    await getSchedulerClient().send(
      new DeleteScheduleCommand({
        Name: scheduleName
      })
    );

    return true;
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return false;
  }
};

const upsertScheduleRequest = (request: CreateRequest | UpdateRequest): Omit<CreateScheduleInput | UpdateScheduleInput, 'Name'> => {
  const { startDate, endDate, maxRetries, maxAge, enabled } = request;

  const hasEnabled = isAnyBoolean(enabled);
  const hasMaxRetryAttempts = isAnyNumber(maxRetries);
  const hasMaxEventAge = isAnyNumber(maxAge);

  const hasRetryPolicy = hasMaxEventAge || hasMaxRetryAttempts;

  return {
    GroupName: request.groupName,
    Description: request.description,
    ScheduleExpression: request.expression,
    ScheduleExpressionTimezone: request.timezone,
    ...(hasEnabled && { State: enabled ? ScheduleState.ENABLED : ScheduleState.DISABLED }),
    ...(startDate && { StartDate: new Date(startDate) }),
    ...(endDate && { EndDate: new Date(endDate) }),
    FlexibleTimeWindow: {
      Mode: FlexibleTimeWindowMode.OFF
    },
    Target: {
      Arn: request.functionArn,
      RoleArn: request.roleArn,
      ...(hasRetryPolicy && {
        RetryPolicy: {
          ...(hasMaxRetryAttempts && { MaximumRetryAttempts: maxRetries }),
          ...(hasMaxEventAge && { MaximumEventAgeInSeconds: maxAge })
        }
      })
    }
  };
};
