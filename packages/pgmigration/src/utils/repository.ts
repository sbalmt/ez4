import { isRepositoryTable, type PgTableRepository } from '@ez4/pgclient/library';

import { deepEqual, deepCompareObject, isAnyObject } from '@ez4/utils';
import { isAnySchema } from '@ez4/schema';

export const getTableRepositoryChanges = (target: PgTableRepository, source: PgTableRepository) => {
  return deepCompareObject(target, source, {
    depth: 4,
    onRename: (target, source) => {
      if (!isAnyObject(target) || !isAnyObject(source)) {
        return target !== source;
      }

      if (isRepositoryTable(target) && isRepositoryTable(source)) {
        return target.name !== source.name;
      }

      if (!isAnySchema(target) || !isAnySchema(source)) {
        return deepEqual(target, source);
      }

      return deepEqual(target, source, {
        depth: 2,
        include: {
          type: true,
          definitions: true,
          nullable: true
        }
      });
    }
  });
};
