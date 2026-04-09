import type { Cron, ScheduleEvent, Client as CronClient } from '@ez4/scheduler';
import type { EventSchema } from '@ez4/scheduler/utils';
import type { Arn } from '@ez4/aws-common';

import {
  SchedulerClient,
  ActionAfterCompletion,
  FlexibleTimeWindowMode,
  ResourceNotFoundException,
  CreateScheduleCommand,
  DeleteScheduleCommand,
  UpdateScheduleCommand,
  GetScheduleCommand
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
  type EventInput<T extends Cron.Event> = {
    date: Date | string;
    maxRetries?: number;
    maxAge?: number;
    event: T | string;
  };

  export const make = <T extends Cron.Event>(
    roleArn: Arn,
    functionArn: Arn,
    groupName: string | undefined,
    parameters: ClientParameters
  ): CronClient<T> => {
    const getEventName = (identifier: string) => {
      return `${parameters.prefix}-${identifier}`;
    };

    const getEventInput = (identifier: string, functionArn: Arn, roleArn: Arn, input: EventInput<T>) => {
      const date = input.date instanceof Date ? prepareEventDate(input.date) : input.date;
      const event = input.event instanceof Object ? prepareEventData(input.event) : input.event;

      const maxRetries = input.maxRetries ?? parameters.defaults.maxRetries;
      const maxAge = input.maxAge ?? parameters.defaults.maxAge;

      const hasMaxRetries = isAnyNumber(maxRetries);
      const hasMaxAge = isAnyNumber(maxAge);

      const hasPolicy = hasMaxRetries || hasMaxAge;

      return {
        GroupName: groupName,
        ScheduleExpression: date,
        Name: getEventName(identifier),
        ActionAfterCompletion: ActionAfterCompletion.DELETE,
        FlexibleTimeWindow: {
          Mode: FlexibleTimeWindowMode.OFF
        },
        Target: {
          Arn: functionArn,
          RoleArn: roleArn,
          Input: event,
          ...(hasPolicy && {
            RetryPolicy: {
              ...(hasMaxRetries && { MaximumRetryAttempts: maxRetries }),
              ...(hasMaxAge && { MaximumEventAgeInSeconds: maxAge })
            }
          })
        }
      };
    };

    return new (class {
      async getEvent(identifier: string) {
        try {
          const { ScheduleExpression, Target } = await client.send(
            new GetScheduleCommand({
              Name: getEventName(identifier),
              GroupName: groupName
            })
          );

          const eventDate = ScheduleExpression!.substring(3, 22);
          const eventPolicy = Target!.RetryPolicy;

          const { event } = JSON.parse(Target!.Input!);

          return {
            date: new Date(`${eventDate}Z`),
            maxRetries: eventPolicy?.MaximumRetryAttempts,
            maxAge: eventPolicy?.MaximumEventAgeInSeconds,
            event
          };
        } catch (error) {
          if (!(error instanceof ResourceNotFoundException)) {
            throw error;
          }

          return undefined;
        }
      }

      async setEvent(identifier: string, input: ScheduleEvent<T>) {
        const { event, ...eventInput } = input;

        const command = getEventInput(identifier, functionArn, roleArn, {
          event: await getJsonEvent(event, parameters.schema),
          ...eventInput
        });

        try {
          await client.send(new UpdateScheduleCommand(command));
        } catch (error) {
          if (error instanceof ResourceNotFoundException) {
            await client.send(new CreateScheduleCommand(command));
          } else {
            throw error;
          }
        }
      }

      async createEvent(identifier: string, input: ScheduleEvent<T>) {
        const { event, ...eventInput } = input;

        await client.send(
          new CreateScheduleCommand(
            getEventInput(identifier, functionArn, roleArn, {
              event: await getJsonEvent(event, parameters.schema),
              ...eventInput
            })
          )
        );
      }

      async updateEvent(identifier: string, input: Partial<ScheduleEvent<T>>) {
        const eventResponse = await client.send(
          new GetScheduleCommand({
            Name: getEventName(identifier),
            GroupName: groupName
          })
        );

        const eventTarget = eventResponse.Target;
        const eventPolicy = eventTarget?.RetryPolicy;

        await client.send(
          new UpdateScheduleCommand(
            getEventInput(identifier, functionArn, roleArn, {
              event: input.event ? await getJsonEvent(input.event, parameters.schema) : eventTarget?.Input!,
              maxRetries: input.maxRetries ?? eventPolicy?.MaximumRetryAttempts,
              maxAge: input.maxAge ?? eventPolicy?.MaximumEventAgeInSeconds,
              date: input.date ?? eventResponse.ScheduleExpression!
            })
          )
        );
      }

      async deleteEvent(identifier: string) {
        try {
          await client.send(
            new DeleteScheduleCommand({
              Name: getEventName(identifier),
              GroupName: groupName
            })
          );

          return true;
        } catch (error) {
          if (error instanceof ResourceNotFoundException) {
            return false;
          }

          throw error;
        }
      }
    })();
  };

  const prepareEventDate = (date: Date) => {
    return `at(${date.toISOString().substring(0, 19)})`;
  };

  const prepareEventData = <T extends Cron.Event>(data: T) => {
    const scope = Runtime.getScope();

    return JSON.stringify({
      traceId: scope?.traceId ?? getRandomUUID(),
      event: data
    });
  };
}
