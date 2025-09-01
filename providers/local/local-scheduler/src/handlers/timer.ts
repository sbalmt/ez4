import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { Logger } from '@ez4/project/library';

import { ExpressionType, parseExpression } from '../utils/expression';
import { InMemoryScheduler } from '../service/scheduler';

export const processTimerEvent = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: serviceName, expression } = service;
  const { interval, type, value } = parseExpression(expression);

  switch (type) {
    case ExpressionType.Cron: {
      Logger.log(`⌚ Scheduler [${serviceName}] will run using cron (${value})`);

      InMemoryScheduler.createTimer(serviceName, 'cron', interval, () => {
        processTimerEvent(service, options, context);
      });

      break;
    }

    case ExpressionType.Rate: {
      Logger.log(`⌚ Scheduler [${serviceName}] will run in ${value}`);

      InMemoryScheduler.createTimer(serviceName, 'rate', interval, () => {
        processTimerEvent(service, options, context);
      });

      break;
    }

    case ExpressionType.At: {
      Logger.log(`⌚ Scheduler [${serviceName}] will run at ${value}`);

      InMemoryScheduler.createTimer(serviceName, 'at', interval);
      break;
    }
  }
};
