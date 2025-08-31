import type { Index } from '../services/indexes.js';

export type TableIndex = {
  name: string;
  columns: string[];
  type: Index;
};
