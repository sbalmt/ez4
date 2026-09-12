import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { escapeSqlData, escapeSqlName, escapeSqlNames, escapeSqlText } from '@ez4/pgsql';
import { UnsupportedSqlDataError } from '@ez4/pgsql';

describe('sql escape tests', () => {
  it('assert :: escape text', () => {
    equal(escapeSqlText('plain text'), `'plain text'`);
    equal(escapeSqlText(''), `''`);
  });

  it('assert :: escape text apostrophes', () => {
    equal(escapeSqlText(`O'Reilly`), `'O''Reilly'`);
    equal(escapeSqlText(`It's Sam's book`), `'It''s Sam''s book'`);
  });

  it('assert :: escape names', () => {
    equal(escapeSqlName('*'), '*');
    equal(escapeSqlName('user"name'), '"user""name"');
    equal(escapeSqlNames(['foo', 'bar']), '"foo", "bar"');
  });

  it('assert :: escape data', ({ assert }) => {
    equal(escapeSqlData(123), 123);
    equal(escapeSqlData(true), true);
    equal(escapeSqlData(`O'Reilly`), `'O''Reilly'`);
    equal(escapeSqlData({ foo: 'bar' }), `'{"foo":"bar"}'`);

    assert.throws(() => escapeSqlData(undefined), UnsupportedSqlDataError);
  });
});
