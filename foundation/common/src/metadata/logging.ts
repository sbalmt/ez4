import type { ModelProperty } from '@ez4/reflection';

import { LogLevel } from '@ez4/project';

import { getPropertyStringIn } from '../reflection/property';

export const getServiceLogLevel = (member: ModelProperty) => {
  return getPropertyStringIn(member, [LogLevel.Debug, LogLevel.Information, LogLevel.Warning, LogLevel.Error]);
};
