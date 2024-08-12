import type { Database, Query } from '@ez4/database';

import { prepareInsertFields } from './helpers/insert.js';
import { prepareUpdateFields } from './helpers/update.js';
import { prepareSelectFields } from './helpers/select.js';
import { prepareWhereFields } from './helpers/where.js';

export type PrepareResult = [string, unknown[]];

export const prepareInsert = <T extends Database.Schema>(
  table: string,
  query: Query.InsertOneInput<T>
): PrepareResult => {
  const [insertFields, insertVariables] = prepareInsertFields(query.data);

  const statement = `INSERT INTO "${table}" value ${insertFields}`;

  return [statement, insertVariables];
};

export const prepareUpdate = <T extends Database.Schema, U extends Query.SelectInput<T> = {}>(
  table: string,
  query: Query.UpdateManyInput<T, U>
): PrepareResult => {
  const [updateFields, updateVariables] = prepareUpdateFields(query.data);
  const [whereFields, whereVariables] = prepareWhereFields(query.where);

  const statement = [`UPDATE "${table}" ${updateFields}`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  if (query.select) {
    statement.push('RETURNING ALL OLD *');
  }

  return [statement.join(' '), [...updateVariables, ...whereVariables]];
};

export const prepareSelect = <T extends Database.Schema, U extends Query.SelectInput<T> = {}>(
  table: string,
  query: Query.FindFirstInput<T, U> | Query.FindManyInput<T, U>
): PrepareResult => {
  const [whereFields, whereVariables] = prepareWhereFields(query.where);

  const selectFields = prepareSelectFields(query.select);

  const statement = [`SELECT ${selectFields} FROM "${table}"`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  return [statement.join(' '), whereVariables];
};

export const prepareDelete = <T extends Database.Schema, U extends Query.SelectInput<T> = {}>(
  table: string,
  query: Query.DeleteManyInput<T, U>
): PrepareResult => {
  const [whereFields, whereVariables] = prepareWhereFields(query.where);

  const statement = [`DELETE FROM "${table}"`];

  if (whereFields) {
    statement.push(`WHERE ${whereFields}`);
  }

  if (query.select) {
    statement.push('RETURNING ALL OLD *');
  }

  return [statement.join(' '), whereVariables];
};
