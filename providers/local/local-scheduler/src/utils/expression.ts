import { TimeUnits } from './time.js';

export const enum ExpressionType {
  Rate = 'rate',
  At = 'at'
}

export const parseRateExpression = (input: string) => {
  const match = input.match(/^rate\(\s*(\d+)\s+(minute|minutes|hour|hours|day|days)\s*\)$/i);

  if (match) {
    const unit = match[2] as keyof typeof TimeUnits;
    const time = parseInt(match[1], 10);

    return {
      type: ExpressionType.Rate,
      interval: time * TimeUnits[unit],
      value: `${time} ${unit}`
    };
  }

  return undefined;
};

export const parseAtExpression = (input: string) => {
  const match = input.match(/^at\((\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\)$/i);

  if (match) {
    const atDate = new Date(`${match[1]}Z`);

    return {
      type: ExpressionType.At,
      interval: atDate.getTime() - Date.now(),
      value: atDate.toISOString()
    };
  }

  return undefined;
};

export const parseExpression = (input: string) => {
  const expression = parseRateExpression(input) ?? parseAtExpression(input);

  if (!expression) {
    throw new Error(`Expression '${input}' isn\'t supported.`);
  }

  return expression;
};
