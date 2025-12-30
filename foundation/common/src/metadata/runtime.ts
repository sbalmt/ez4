import type { ModelProperty } from '@ez4/reflection';

import { getPropertyStringIn } from '../reflection/property';
import { RuntimeType } from '../types/runtime';

export const getServiceRuntime = (member: ModelProperty) => {
  return getPropertyStringIn(member, [RuntimeType.Node22, RuntimeType.Node24]);
};
