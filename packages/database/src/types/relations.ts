export type TableRelation = {
  sourceTable: string;
  sourceColumn: string;
  targetColumn: string;
  targetAlias: string;
  foreign: boolean;
};
