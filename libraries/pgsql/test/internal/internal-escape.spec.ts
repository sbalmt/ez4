import { describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { escapeSqlText } from '@ez4/pgsql';

describe('sql escape tests', () => {
  it('assert :: escape text', () => {
    equal(escapeSqlText('plain text'), `'plain text'`);
    equal(escapeSqlText(''), `''`);
  });

  it('assert :: escape text apostrophes', () => {
    equal(escapeSqlText(`O'Reilly`), `'O''Reilly'`);
    equal(escapeSqlText(`It's Sam's book`), `'It''s Sam''s book'`);
  });
});
