import type { ScheduleOptions, Client as CronClient } from '@ez4/scheduler';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Arn } from '@ez4/aws-common';

import {
  SchedulerClient,
  ActionAfterCompletion,
  FlexibleTimeWindowMode,
  CreateScheduleCommand,
  DeleteScheduleCommand
} from '@aws-sdk/client-scheduler';

import { getJsonEvent } from '@ez4/aws-scheduler/runtime';
import { isAnyNumber } from '@ez4/utils';

const client = new SchedulerClient({});

export type ClientEventSchema = ObjectSchema | UnionSchema;

export type ClientParameters = {
  defaults: ScheduleOptions;
  schema: ClientEventSchema;
  prefix: string;
};

export namespace Client {
  export const make = <T extends ClientEventSchema>(
    roleArn: Arn,
    functionArn: Arn,
    groupName: string | undefined,
    parameters: ClientParameters
  ): CronClient<T> => {
    return new (class {
      async scheduleEvent(identifier: string, at: Date, event: T, options?: ScheduleOptions) {
        const safeEvent = await getJsonEvent(event, parameters.schema);
        const rawEvent = JSON.stringify(safeEvent);

        const { timezone, maxRetries, maxAge } = options ?? parameters.defaults;

        const hasMaxRetryAttempts = isAnyNumber(maxRetries);
        const hasMaxEventAge = isAnyNumber(maxAge);

        const hasRetryPolicy = hasMaxRetryAttempts || hasMaxEventAge;

        const atDate = at.toISOString().substring(0, 19);

        await client.send(
          new CreateScheduleCommand({
            Name: `${parameters.prefix}-${identifier}`,
            GroupName: groupName,
            ScheduleExpression: `at(${atDate})`,
            ScheduleExpressionTimezone: timezone,
            ActionAfterCompletion: ActionAfterCompletion.DELETE,
            FlexibleTimeWindow: {
              Mode: FlexibleTimeWindowMode.OFF
            },
            Target: {
              Arn: functionArn,
              RoleArn: roleArn,
              Input: rawEvent,
              ...(hasRetryPolicy && {
                RetryPolicy: {
                  ...(hasMaxRetryAttempts && { MaximumRetryAttempts: maxRetries }),
                  ...(hasMaxEventAge && { MaximumEventAgeInSeconds: maxAge })
                }
              })
            }
          })
        );
      }

      async cancelEvent(identifier: string) {
        await client.send(
          new DeleteScheduleCommand({
            Name: identifier
          })
        );
      }
    })();
  };
}
