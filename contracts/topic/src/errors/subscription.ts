import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteSubscriptionError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete topic subscription', properties, fileName);
  }
}

export class InvalidSubscriptionTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid subscription type', undefined, 'Topic.Subscription', fileName);
  }
}

export class IncorrectSubscriptionTypeError extends IncorrectTypeError {
  constructor(
    public subscriptionType: string,
    fileName?: string
  ) {
    super('Incorrect subscription type', subscriptionType, 'Topic.Subscription', fileName);
  }
}
