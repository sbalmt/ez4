import type { PgTableRepository } from '@ez4/pgclient/library';
import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { deepEqual, deepCompareObject, isAnyObject } from '@ez4/utils';
import { isRepositoryTable } from '@ez4/pgclient/library';
import { isAnySchema } from '@ez4/schema';

export const getTableRepositoryChanges = (target: PgTableRepository, source: PgTableRepository) => {
  return deepCompareObject(target, source, {
    depth: 5,
    onRename: (target, source) => {
      if (!isAnyObject(target) || !isAnyObject(source)) {
        return false;
      }

      if (isRepositoryTable(target) && isRepositoryTable(source)) {
        return canRenameTable(target.schema, source.schema);
      }

      if (isAnySchema(target) && isAnySchema(source)) {
        return canRenameColumn(target, source);
      }

      return false;
    }
  });
};

const canRenameTable = (target: ObjectSchema, source: ObjectSchema) => {
  return deepEqual(Object.keys(target.properties), Object.keys(source.properties));
};

const canRenameColumn = (target: AnySchema, source: AnySchema) => {
  return deepEqual(target, source, {
    depth: 1,
    include: {
      type: true,
      definitions: true,
      nullable: true,
      format: true
    }
  });
};
