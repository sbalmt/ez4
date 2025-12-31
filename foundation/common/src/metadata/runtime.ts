import type { ModelProperty } from '@ez4/reflection';

import { RuntimeType } from '@ez4/project';

import { getPropertyStringIn } from '../reflection/property';

export const getServiceRuntime = (member: ModelProperty) => {
  return getPropertyStringIn(member, [RuntimeType.Node22, RuntimeType.Node24]);
};
