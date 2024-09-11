import type { Arn, ResourceTags } from '@ez4/aws-common';

import {
  DeleteRuleCommand,
  EventBridgeClient,
  PutRuleCommand,
  RuleState,
  TagResourceCommand,
  UntagResourceCommand
} from '@aws-sdk/client-eventbridge';

import { getTagList, Logger } from '@ez4/aws-common';

import { RuleServiceName } from './types.js';

const client = new EventBridgeClient({});

export type CreateRequest = {
  ruleName: string;
  expression: string;
  enabled: boolean;
  description?: string;
  tags?: ResourceTags;
};

export type CreateResponse = {
  ruleArn: Arn;
};

export type UpdateRequest = {
  enabled?: boolean;
  description?: string;
  expression?: string;
};

export const createRule = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(RuleServiceName, request.ruleName);

  const { ruleName, description, expression, enabled } = request;

  const response = await client.send(
    new PutRuleCommand({
      Name: ruleName,
      Description: description,
      ScheduleExpression: expression,
      State: enabled ? RuleState.ENABLED : RuleState.DISABLED,
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const ruleArn = response.RuleArn as Arn;

  return {
    ruleArn
  };
};

export const updateRule = async (ruleName: string, request: UpdateRequest) => {
  Logger.logUpdate(RuleServiceName, ruleName);

  const { description, expression, enabled } = request;

  await client.send(
    new PutRuleCommand({
      Name: ruleName,
      ...(description && { Description: description }),
      ...(expression && { ScheduleExpression: expression }),
      ...(enabled !== undefined && {
        State: enabled ? RuleState.ENABLED : RuleState.DISABLED
      })
    })
  );
};

export const tagRule = async (ruleArn: string, tags: ResourceTags) => {
  Logger.logTag(RuleServiceName, ruleArn);

  await client.send(
    new TagResourceCommand({
      ResourceARN: ruleArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagRule = async (ruleArn: string, tagKeys: string[]) => {
  Logger.logUntag(RuleServiceName, ruleArn);

  await client.send(
    new UntagResourceCommand({
      ResourceARN: ruleArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteRule = async (ruleName: string) => {
  Logger.logDelete(RuleServiceName, ruleName);

  await client.send(
    new DeleteRuleCommand({
      Name: ruleName
    })
  );
};
