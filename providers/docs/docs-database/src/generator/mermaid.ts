import type { DatabaseService, DatabaseTable, TableIndex, TableRelation } from '@ez4/database/library';
import type { ObjectSchemaProperties } from '@ez4/schema';

import { Index } from '@ez4/database/library';

export const getDatabaseOutput = (databaseService: DatabaseService) => {
  const output = ['erDiagram'];

  for (const table of databaseService.tables) {
    const { schema, indexes, relations = [] } = table;

    const allRelations = getRelationsOutput(table.name, databaseService.tables, schema.properties, relations);
    const allColumns = getColumnsOutput(schema.properties, relations, indexes);

    output.push(`\t${table.name} {`);
    output.push(allColumns);
    output.push('\t}');

    if (allRelations.length > 0) {
      output.push(allRelations);
    }
  }

  return output.join('\n');
};

export const getColumnsOutput = (columns: ObjectSchemaProperties, relations: TableRelation[], indexes: TableIndex[]) => {
  const output = [];

  for (const name in columns) {
    const index = indexes.find((index) => index.columns.includes(name));

    const schema = columns[name];
    const column = [name, schema.type];

    switch (index?.type) {
      default: {
        const relation = relations.find((relation) => relation.targetColumn === name);
        const indexType = relation?.sourceIndex;

        if (indexType === Index.Primary || indexType === Index.Unique) {
          column.push('FK');
        }

        break;
      }

      case Index.Primary:
        column.push('PK');
        break;

      case Index.Unique:
        column.push('UK');
        break;
    }

    output.push(`\t\t${column.join(' ')}`);
  }

  return output.join('\n');
};

export const getRelationsOutput = (
  targetTable: string,
  tables: DatabaseTable[],
  columns: ObjectSchemaProperties,
  relations: TableRelation[]
) => {
  const output = [];

  const getConnectionLabel = (tableName: string, columnName: string) => {
    return `${tableName}(${columnName})`;
  };

  for (const relation of relations) {
    const { sourceTable, sourceColumn, targetColumn, sourceIndex, targetIndex } = relation;

    const sourceTableData = tables.find((table) => table.name === sourceTable);

    const sourceLabel = getConnectionLabel(sourceTable, sourceColumn);
    const targetLabel = getConnectionLabel(targetTable, targetColumn);

    const isSourceNullable = sourceTableData?.schema.properties[sourceColumn]?.nullable;
    const isTargetNullable = columns[targetColumn]?.nullable;

    const sourceConnector = `${isSourceNullable ? 'o' : '|'}`;
    const targetConnector = `${isTargetNullable ? 'o' : '|'}`;

    const connection = [];

    if (targetIndex === Index.Primary || targetIndex === Index.Unique) {
      connection.push(targetTable);

      if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
        connection.push(`|${targetConnector}--${sourceConnector}|`);
      } else {
        connection.push(`|${targetConnector}--o{`);
      }

      connection.push(sourceTable, ':', `"${targetLabel} → ${sourceLabel}"`);
    } else {
      const hasOtherSideRelation = sourceTableData?.relations?.some((relation) => {
        return relation.sourceTable === targetTable && relation.sourceColumn === targetColumn;
      });

      if (!hasOtherSideRelation) {
        connection.push(sourceTable);

        if (sourceIndex === Index.Primary || sourceIndex === Index.Unique) {
          connection.push(`|${sourceConnector}--${targetConnector}{`);
        } else {
          connection.push(`|${sourceConnector}--o{`);
        }

        connection.push(targetTable, ':', `"${sourceLabel} → ${targetLabel}"`);
      }
    }

    if (connection.length > 0) {
      output.push(`\t${connection.join(' ')}`);
    }
  }

  return output.join('\n');
};
