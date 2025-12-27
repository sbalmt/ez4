import type { ModelProperty } from '@ez4/reflection';

import { getPropertyStringIn } from '../reflection/property';
import { ServiceRuntime } from '../types/runtime';

export const getServiceRuntime = (member: ModelProperty) => {
  return getPropertyStringIn(member, [ServiceRuntime.Node22, ServiceRuntime.Node24]);
};
