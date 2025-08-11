import type { Cron, ScheduleEvent, Client as CronClient } from '@ez4/scheduler';
import type { EventSchema } from '@ez4/scheduler/utils';
import type { Arn } from '@ez4/aws-common';

import {
  SchedulerClient,
  ActionAfterCompletion,
  FlexibleTimeWindowMode,
  GetScheduleCommand,
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
  ResourceNotFoundException
} from '@aws-sdk/client-scheduler';

import { getJsonStringEvent } from '@ez4/scheduler/utils';
import { isAnyNumber } from '@ez4/utils';

const client = new SchedulerClient({});

export type ClientEventDefaults = Pick<ScheduleEvent<never>, 'maxRetries' | 'maxAge'>;

export type ClientParameters = {
  defaults: ClientEventDefaults;
  schema: EventSchema;
  prefix: string;
};

export namespace Client {
  export const make = <T extends Cron.Event>(
    roleArn: Arn,
    functionArn: Arn,
    groupName: string | undefined,
    parameters: ClientParameters
  ): CronClient<T> => {
    return new (class {
      async getEvent(identifier: string) {
        try {
          const { ScheduleExpression, Target } = await client.send(
            new GetScheduleCommand({
              Name: `${parameters.prefix}-${identifier}`,
              GroupName: groupName
            })
          );

          const date = ScheduleExpression!.substring(3, 22);
          const policy = Target!.RetryPolicy;

          return {
            date: new Date(`${date}Z`),
            event: JSON.parse(Target!.Input!),
            maxRetries: policy?.MaximumRetryAttempts,
            maxAge: policy?.MaximumEventAgeInSeconds
          };
        } catch (error) {
          if (!(error instanceof ResourceNotFoundException)) {
            throw error;
          }

          return undefined;
        }
      }

      async createEvent(identifier: string, input: ScheduleEvent<T>) {
        const message = await getJsonStringEvent(input.event, parameters.schema);

        const defaults = parameters.defaults;

        const maxRetries = input.maxRetries ?? defaults.maxRetries;
        const hasMaxRetries = isAnyNumber(maxRetries);

        const maxAge = input.maxAge ?? defaults.maxAge;
        const hasMaxAge = isAnyNumber(maxAge);

        const hasPolicy = hasMaxRetries || hasMaxAge;

        await client.send(
          new CreateScheduleCommand({
            Name: `${parameters.prefix}-${identifier}`,
            GroupName: groupName,
            ScheduleExpression: `at(${input.date.toISOString().substring(0, 19)})`,
            ActionAfterCompletion: ActionAfterCompletion.DELETE,
            FlexibleTimeWindow: {
              Mode: FlexibleTimeWindowMode.OFF
            },
            Target: {
              Arn: functionArn,
              RoleArn: roleArn,
              Input: message,
              ...(hasPolicy && {
                RetryPolicy: {
                  ...(hasMaxRetries && { MaximumRetryAttempts: maxRetries }),
                  ...(hasMaxAge && { MaximumEventAgeInSeconds: maxAge })
                }
              })
            }
          })
        );
      }

      async updateEvent(identifier: string, input: Partial<ScheduleEvent<T>>) {
        const response = await client.send(
          new GetScheduleCommand({
            Name: `${parameters.prefix}-${identifier}`,
            GroupName: groupName
          })
        );

        const target = response.Target;
        const policy = target?.RetryPolicy;

        const date = input.date ? `at(${input.date.toISOString().substring(0, 19)})` : response.ScheduleExpression;

        const message = input.event ? await getJsonStringEvent(input.event, parameters.schema) : target?.Input;

        const defaults = parameters.defaults;

        const maxRetries = policy?.MaximumRetryAttempts ?? input.maxRetries ?? defaults.maxRetries;
        const hasMaxRetries = isAnyNumber(maxRetries);

        const maxAge = policy?.MaximumEventAgeInSeconds ?? input.maxAge ?? defaults.maxAge;
        const hasMaxAge = isAnyNumber(maxAge);

        const hasPolicy = hasMaxRetries || hasMaxAge;

        await client.send(
          new UpdateScheduleCommand({
            Name: response.Name,
            GroupName: groupName,
            ScheduleExpression: date,
            ActionAfterCompletion: ActionAfterCompletion.DELETE,
            FlexibleTimeWindow: {
              Mode: FlexibleTimeWindowMode.OFF
            },
            Target: {
              Arn: functionArn,
              RoleArn: roleArn,
              Input: message,
              ...(hasPolicy && {
                RetryPolicy: {
                  ...(hasMaxRetries && { MaximumRetryAttempts: maxRetries }),
                  ...(hasMaxAge && { MaximumEventAgeInSeconds: maxAge })
                }
              })
            }
          })
        );
      }

      async deleteEvent(identifier: string) {
        await client.send(
          new DeleteScheduleCommand({
            Name: `${parameters.prefix}-${identifier}`,
            GroupName: groupName
          })
        );
      }
    })();
  };
}
