import type { Index } from '../services/indexes';

export type TableRelation = {
  sourceTable: string;
  sourceColumn: string;
  sourceIndex?: Index;
  targetColumn: string;
  targetAlias: string;
  targetIndex?: Index;
};
