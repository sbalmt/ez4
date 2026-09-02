import type { PgTableRepository, PgTableIndex } from '@ez4/pgclient/library';
import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { deepEqual, deepCompareObject, isAnyObject, toSnakeCase } from '@ez4/utils';
import { isTableMetadata, isTableIndex } from '@ez4/pgclient/library';
import { isAnySchema } from '@ez4/schema';

export const getTableRepositoryChanges = (target: PgTableRepository, source: PgTableRepository) => {
  return deepCompareObject(target, source, {
    onCompareName: (target, source) => {
      const targetParts = new Set(toSnakeCase(target).split('_'));
      const sourceParts = new Set(toSnakeCase(source).split('_'));

      for (const sourcePart of sourceParts) {
        if (sourcePart.length > 1 && targetParts.has(sourcePart)) {
          return true;
        }
      }

      return false;
    },
    onRename: (target, source) => {
      if (!isAnyObject(target) || !isAnyObject(source)) {
        return false;
      }

      if (isTableMetadata(target) && isTableMetadata(source)) {
        return canRenameTable(target.schema, source.schema);
      }

      if (isTableIndex(target) && isTableIndex(source)) {
        return canRenameIndex(target, source);
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

const canRenameIndex = (target: PgTableIndex, source: PgTableIndex) => {
  return target.type === source.type && deepEqual(target.columns, source.columns);
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
