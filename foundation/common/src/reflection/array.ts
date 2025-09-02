import type { ModelProperty } from '@ez4/reflection';

import { isTypeString } from '@ez4/reflection';

import { getPropertyTuple } from './property';

export const getArrayStrings = (member: ModelProperty) => {
  const items = getPropertyTuple(member) ?? [];

  if (!items.length) {
    return undefined;
  }

  const list: string[] = [];

  for (const item of items) {
    if (!isTypeString(item) || !item.literal) {
      continue;
    }

    list.push(item.literal);
  }

  return list;
};
