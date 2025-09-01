import { CronExpressionParser } from 'cron-parser';

import { TimeUnits } from './time';

export const enum ExpressionType {
  Cron = 'cron',
  Rate = 'rate',
  At = 'at'
}

export type ExpressionResult = {
  type: ExpressionType;
  interval: number;
  value: string;
};

export const parseRateExpression = (input: string): ExpressionResult | undefined => {
  const match = input.match(/^rate\(\s*(\d+)\s+(minute|minutes|hour|hours|day|days)\s*\)$/i);

  if (match?.length !== 3) {
    return undefined;
  }

  const unit = match[2] as keyof typeof TimeUnits;
  const time = parseInt(match[1], 10);

  return {
    type: ExpressionType.Rate,
    interval: time * TimeUnits[unit],
    value: `${time} ${unit}`
  };
};

export const parseCronExpression = (input: string): ExpressionResult | undefined => {
  const match = input.match(/^cron\(((\S+\s+){4}\S+)\)$/i);

  const value = match?.[1];

  if (!value) {
    return undefined;
  }

  try {
    const date = CronExpressionParser.parse(value).next();

    return {
      type: ExpressionType.Cron,
      interval: date.getTime() - Date.now(),
      value
    };
  } catch {
    return undefined;
  }
};

export const parseAtExpression = (input: string): ExpressionResult | undefined => {
  const match = input.match(/^at\((\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\)$/i);

  if (match?.length !== 2) {
    return undefined;
  }

  const value = match[1];
  const date = new Date(`${value}Z`);

  return {
    type: ExpressionType.At,
    interval: date.getTime() - Date.now(),
    value
  };
};

export const parseExpression = (input: string) => {
  const expression = parseRateExpression(input) ?? parseCronExpression(input) ?? parseAtExpression(input);

  if (!expression) {
    throw new Error(`Expression '${input}' isn\'t supported.`);
  }

  return expression;
};
