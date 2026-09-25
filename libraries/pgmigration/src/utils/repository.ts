import type { PgTableRepository, PgTableIndex } from '@ez4/pgclient/library';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { ObjectComparison } from '@ez4/utils';

import { deepEqual, deepCompareObject, isAnyObject, toSnakeCase } from '@ez4/utils';
import { isTableMetadata, isTableIndex } from '@ez4/pgclient/library';
import { isAnySchema } from '@ez4/schema';

export type PgTableRepositoryChanges = ObjectComparison & {
  source: PgTableRepository;
};

export const getTableRepositoryChanges = (target: PgTableRepository, source: PgTableRepository) => {
  const changes = getRepositoryChanges(target, source);
  const normalizedSource = { ...source };
  const nested = { ...changes.nested };

  if (changes.rename) {
    for (const fromTable in changes.rename) {
      const toTable = changes.rename[fromTable];

      normalizedSource[toTable] = normalizedSource[fromTable];

      delete normalizedSource[fromTable];

      const { nested: nestedChanges } = getRepositoryChanges(
        {
          [toTable]: target[toTable]
        },
        {
          [toTable]: source[fromTable]
        }
      );

      const renamedChanges = nestedChanges?.[toTable];

      if (renamedChanges) {
        nested[toTable] = renamedChanges;
      }
    }
  }

  return {
    ...changes,
    source: normalizedSource,
    nested
  };
};

const getRepositoryChanges = (target: PgTableRepository, source: PgTableRepository) => {
  return deepCompareObject(target, source, {
    onRename: (targetKey, sourceKey, targetValue, sourceValue) => {
      if (!isAnyObject(targetValue) || !isAnyObject(sourceValue)) {
        return false;
      }

      if (isTableMetadata(targetValue) && isTableMetadata(sourceValue)) {
        return canRenameBasedTableSchema(targetKey, sourceKey, targetValue.schema, sourceValue.schema);
      }

      if (isTableIndex(targetValue) && isTableIndex(sourceValue)) {
        return canRenameBasedOnIndexColumns(targetKey, sourceKey, targetValue, sourceValue);
      }

      if (isAnySchema(targetValue) && isAnySchema(sourceValue)) {
        return canRenameBasedOnColumnSechema(targetKey, sourceKey, targetValue, sourceValue);
      }

      return false;
    }
  });
};

const canRenameBasedOnIndexColumns = (targetKey: string, sourceKey: string, targetValue: PgTableIndex, sourceValue: PgTableIndex) => {
  if (targetValue.type === sourceValue.type) {
    if (!deepEqual(targetValue.columns, sourceValue.columns)) {
      return targetValue.columns.length === sourceValue.columns.length && canRenameBasedOnName(targetKey, sourceKey);
    }

    return true;
  }

  return false;
};

const canRenameBasedTableSchema = (targetKey: string, sourceKey: string, targetValue: ObjectSchema, sourceValue: ObjectSchema) => {
  const targetColumns = Object.keys(targetValue.properties);
  const sourceColumns = Object.keys(sourceValue.properties);

  if (targetColumns.length && sourceColumns.length) {
    const sharedColumns = targetColumns.filter((column) => sourceColumns.includes(column)).length;
    const totalColumns = Math.max(targetColumns.length, sourceColumns.length);

    return sharedColumns / totalColumns >= 0.5;
  }

  return canRenameBasedOnName(targetKey, sourceKey);
};

const canRenameBasedOnColumnSechema = (targetKey: string, sourceKey: string, targetValue: AnySchema, sourceValue: AnySchema) => {
  return (
    canRenameBasedOnName(targetKey, sourceKey) ||
    deepEqual(targetValue, sourceValue, {
      depth: 1,
      include: {
        type: true,
        definitions: true,
        nullable: true,
        format: true
      }
    })
  );
};

const canRenameBasedOnName = (target: string, source: string) => {
  const targetParts = new Set(toSnakeCase(target).split('_'));
  const sourceParts = new Set(toSnakeCase(source).split('_'));

  for (const sourcePart of sourceParts) {
    if (sourcePart.length > 1 && targetParts.has(sourcePart)) {
      return true;
    }
  }

  return false;
};
