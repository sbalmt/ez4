import type { DatabaseService, DatabaseTable } from '@ez4/database/library';

import { Index } from '@ez4/database/library';
import { toPascalCase } from '@ez4/utils';

export namespace EntityRelationshipGenerator {
  export const getDatabaseOutput = (databaseService: DatabaseService) => {
    const output = ['%%{init: { "layout": "elk" } }%%', 'erDiagram'];

    for (const table of databaseService.tables) {
      const tableName = toPascalCase(table.name);

      const allRelations = getRelationsOutput(table, databaseService.tables);
      const allColumns = getColumnsOutput(table);

      output.push(`\t${tableName} {`);
      output.push(...allColumns);
      output.push('\t}');

      output.push(...allRelations);
    }

    return output.join('\n');
  };

  const getColumnsOutput = (table: DatabaseTable) => {
    const { schema, indexes, relations = [] } = table;

    const columns = schema.properties;
    const output = [];

    for (const name in columns) {
      const relation = relations.find((relation) => relation.targetColumn === name);
      const index = indexes.find((index) => index.columns.includes(name));

      const schema = columns[name];
      const column = [name, schema.type];

      const indexType = relation?.sourceIndex;

      const attributes = [];

      if (indexType === Index.Primary || indexType === Index.Unique) {
        attributes.push('FK');
      }

      if (index?.type === Index.Primary) {
        attributes.push('PK');
      }

      if (index?.type === Index.Unique) {
        attributes.push('UK');
      }

      if (attributes.length > 0) {
        column.push(attributes.join(','));
      }

      output.push(`\t\t${column.join(' ')}`);
    }

    return output;
  };

  const getRelationsOutput = (table: DatabaseTable, tables: DatabaseTable[]) => {
    const { schema, relations = [] } = table;

    const targetTable = toPascalCase(table.name);

    const columns = schema.properties;
    const output = [];

    const getConnectionLabel = (tableName: string, columnName: string) => {
      return `${tableName}(${columnName})`;
    };

    for (const relation of relations) {
      const { sourceTable, sourceColumn, targetColumn, sourceIndex, targetIndex } = relation;

      const sourceTableData = tables.find((table) => table.name === sourceTable);

      const sourceLabel = getConnectionLabel(sourceTable, sourceColumn);
      const targetLabel = getConnectionLabel(table.name, targetColumn);

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

        connection.push(toPascalCase(sourceTable), ':', `"${targetLabel} → ${sourceLabel}"`);
      } else {
        const hasOtherSideRelation = sourceTableData?.relations?.some((relation) => {
          return relation.sourceTable === table.name && relation.sourceColumn === targetColumn;
        });

        if (!hasOtherSideRelation) {
          connection.push(toPascalCase(sourceTable));

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

    return output;
  };
}
