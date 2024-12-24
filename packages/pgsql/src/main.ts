import { selectQuery } from './builder/select.js';
import { insertQuery } from './builder/insert.js';
import { updateQuery } from './builder/update.js';
import { deleteQuery } from './builder/delete.js';

export * from './types.js';

export * from './errors/table.js';
export * from './errors/column.js';
export * from './errors/record.js';
export * from './errors/operation.js';

export const Sql = Object.seal({
  select: selectQuery,
  insert: insertQuery,
  update: updateQuery,
  delete: deleteQuery
});
