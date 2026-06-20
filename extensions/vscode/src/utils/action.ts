import type { ManifestAction } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { hashData, sortObject } from '@ez4/utils';

export namespace ActionUtils {
  export const getId = <T extends AnyObject>(host: string, action: ManifestAction<T>) => {
    return hashData(host, action.name);
  };

  export const DefaultGroup = '*';

  export const getGroups = <T extends AnyObject>(actions: ManifestAction<T>[]) => {
    const groups: Record<string, ManifestAction<T>[]> = {};

    for (const action of actions) {
      const { group = DefaultGroup } = action;

      if (groups[group]) {
        groups[group].push(action);
      } else {
        groups[group] = [action];
      }
    }

    return sortObject(groups);
  };
}
