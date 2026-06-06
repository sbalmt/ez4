import type { ModelProperty } from '@ez4/reflection';

import { getPropertyObject } from '../reflection/property';
import { getPlainObject } from '../library';

export const getLinkedOptionsObject = (member: ModelProperty) => {
  const object = getPropertyObject(member);

  if (object) {
    return getPlainObject(object);
  }

  return {};
};
