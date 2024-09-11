import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const RuleServiceName = 'AWS:EventBridge/Rule';

export const RuleServiceType = 'aws:eventbridge.rule';

export type RuleParameters = CreateRequest;

export type RuleResult = CreateResponse;

export type RuleState = EntryState & {
  type: typeof RuleServiceType;
  parameters: RuleParameters;
  result?: RuleResult;
};
