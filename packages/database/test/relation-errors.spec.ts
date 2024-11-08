import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncorrectRelationsTypeError,
  InvalidRelationsTypeError,
  InvalidRelationTargetError,
  InvalidRelationTableError,
  InvalidRelationColumnError
} from '@ez4/database/library';

import { registerTriggers } from '@ez4/database/library';
import { parseFile } from './common/parser.js';

describe.only('database relation errors', () => {
  registerTriggers();

  it('assert :: incorrect table relations', () => {
    const [error1] = parseFile('incorrect-relations', 1);

    ok(error1 instanceof IncorrectRelationsTypeError);

    equal(error1.baseType, 'Database.Relations');
    equal(error1.schemaType, 'TestRelations');
  });

  it('assert :: invalid table relations', () => {
    const [error1] = parseFile('invalid-relations', 1);

    ok(error1 instanceof InvalidRelationsTypeError);
    equal(error1.baseType, 'Database.Relations');
  });

  it('assert :: invalid relation pattern', () => {
    const [error1] = parseFile('invalid-relation-pattern', 1);

    ok(error1 instanceof InvalidRelationTargetError);
    equal(error1.relationSource, 'foo:id');
  });

  it('assert :: invalid relation table', () => {
    const [error1] = parseFile('invalid-relation-table', 1);

    ok(error1 instanceof InvalidRelationTableError);
    equal(error1.relationTable, 'foo');
  });

  it('assert :: invalid relation column', () => {
    const [error1] = parseFile('invalid-relation-column', 1);

    ok(error1 instanceof InvalidRelationColumnError);
    equal(error1.relationColumn, 'random_id');
  });
});
