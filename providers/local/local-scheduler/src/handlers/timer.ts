import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { Logger } from '@ez4/logger';

import { ExpressionType, parseExpression } from '../utils/expression';
import { InMemoryScheduler } from '../service/scheduler';

export const processTimerEvent = (service: CronService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: resourceName, expression } = service;
  const { interval, type, value } = parseExpression(expression);

  switch (type) {
    case ExpressionType.Cron: {
      Logger.log(`⌚ Scheduler [${resourceName}] will run using cron (${value})`);

      InMemoryScheduler.createTimer(resourceName, 'cron', interval, () => {
        processTimerEvent(service, options, context);
      });

      break;
    }

    case ExpressionType.Rate: {
      Logger.log(`⌚ Scheduler [${resourceName}] will run in ${value}`);

      InMemoryScheduler.createTimer(resourceName, 'rate', interval, () => {
        processTimerEvent(service, options, context);
      });

      break;
    }

    case ExpressionType.At: {
      Logger.log(`⌚ Scheduler [${resourceName}] will run at ${value}`);

      InMemoryScheduler.createTimer(resourceName, 'at', interval);
      break;
    }
  }
};
