import type { Index } from '../services/indexes';

export type TableIndex = {
  name: string;
  columns: string[];
  type: Index;
};
