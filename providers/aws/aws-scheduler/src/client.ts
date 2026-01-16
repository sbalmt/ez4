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

import { getRandomUUID, isAnyNumber } from '@ez4/utils';
import { getJsonEvent } from '@ez4/scheduler/utils';
import { Runtime } from '@ez4/common';

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

          const { event } = JSON.parse(Target!.Input!);

          return {
            date: new Date(`${date}Z`),
            maxRetries: policy?.MaximumRetryAttempts,
            maxAge: policy?.MaximumEventAgeInSeconds,
            event
          };
        } catch (error) {
          if (!(error instanceof ResourceNotFoundException)) {
            throw error;
          }

          return undefined;
        }
      }

      async createEvent(identifier: string, input: ScheduleEvent<T>) {
        const event = await getJsonEvent(input.event, parameters.schema);
        const scope = Runtime.getScope();

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
              Input: JSON.stringify({
                traceId: scope?.traceId ?? getRandomUUID(),
                event
              }),
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

        const scope = Runtime.getScope();

        const target = response.Target;
        const policy = target?.RetryPolicy;

        const date = input.date ? `at(${input.date.toISOString().substring(0, 19)})` : response.ScheduleExpression;

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
              Input: !input.event
                ? target?.Input
                : JSON.stringify({
                    traceId: scope?.traceId ?? getRandomUUID(),
                    event: await getJsonEvent(input.event, parameters.schema)
                  }),
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
        try {
          await client.send(
            new DeleteScheduleCommand({
              Name: `${parameters.prefix}-${identifier}`,
              GroupName: groupName
            })
          );

          return true;
        } catch (error) {
          if (!(error instanceof ResourceNotFoundException)) {
            throw error;
          }

          return false;
        }
      }
    })();
  };
}
