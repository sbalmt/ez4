import type { Environment, Service } from '@ez4/common';
import type { Validation } from '@ez4/validation';
import type { EventDb } from '@/dynamo';

import { DateInUseError } from '@/api/errors/date';

export declare class DateValidation extends Validation.Service<string> {
  handler: typeof validateDate;

  services: {
    eventDb: Environment.Service<EventDb>;
  };
}

export async function validateDate(input: Validation.Input<string>, context: Service.Context<DateValidation>) {
  const { eventDb } = context;

  const total = await eventDb.events.count({
    where: {
      date: input.value
    }
  });

  if (total > 0) {
    throw new DateInUseError();
  }
}
